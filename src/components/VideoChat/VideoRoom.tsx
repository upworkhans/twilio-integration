'use client';

import React, { useEffect, useRef, useState } from 'react';
import Video, {
    Room,
    LocalTrack,
    LocalVideoTrack,
    LocalAudioTrack,
    RemoteParticipant,
    RemoteTrack,
    RemoteTrackPublication
} from 'twilio-video';
import { Box, Typography, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const VideoContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#f5f5f5',
}));

const VideoFrame = styled('div')({
    width: '100%',
    height: '300px',
    background: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    '& video': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
});

interface VideoRoomProps {
    token: string;
    roomName: string;
    onLeave: () => void;
    onParticipantsChange?: (participants: string[]) => void;
}

export default function VideoRoom({ token, roomName, onLeave, onParticipantsChange }: VideoRoomProps) {
    const [room, setRoom] = useState<Room | null>(null);
    const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const localVideoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!token) return;
        let currentRoom: Room | null = null;
        let cancelled = false;

        Video.connect(token, {
            name: roomName,
        })
            .then((newRoom) => {
                if (cancelled) {
                    newRoom.disconnect();
                    return;
                }
                setRoom(newRoom);
                currentRoom = newRoom;
                setIsAudioEnabled(true);
                setIsVideoEnabled(true);

                // Attach local video
                Video.createLocalVideoTrack().then((track) => {
                    const div = localVideoRef.current;
                    if (div) {
                        div.appendChild(track.attach());
                    }
                });

                // Handle existing participants
                setParticipants(Array.from(newRoom.participants.values()));

                // Handle new participants
                newRoom.on('participantConnected', (participant) => {
                    setParticipants((prev) => [...prev, participant]);
                });

                newRoom.on('participantDisconnected', (participant) => {
                    setParticipants((prev) => prev.filter((p) => p !== participant));
                });
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Error connecting to room:', err);
                alert('Failed to connect to video room: ' + err.message);
                onLeave();
            });

        return () => {
            cancelled = true;
            if (currentRoom) {
                currentRoom.disconnect();
            }
        };
    }, [token, roomName, onLeave]);

    useEffect(() => {
        if (!onParticipantsChange) return;
        const identities: string[] = [];
        if (room?.localParticipant?.identity) identities.push(room.localParticipant.identity);
        participants.forEach((p) => identities.push(p.identity));
        onParticipantsChange(identities);
    }, [room, participants, onParticipantsChange]);

    const toggleAudio = () => {
        if (!room) return;
        room.localParticipant.audioTracks.forEach((publication) => {
            const track = publication.track as LocalAudioTrack | null;
            if (!track) return;
            if (isAudioEnabled) track.disable();
            else track.enable();
        });
        setIsAudioEnabled((prev) => !prev);
    };

    const toggleVideo = () => {
        if (!room) return;
        room.localParticipant.videoTracks.forEach((publication) => {
            const track = publication.track as LocalVideoTrack | null;
            if (!track) return;
            if (isVideoEnabled) track.disable();
            else track.enable();
        });
        setIsVideoEnabled((prev) => !prev);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Room: {roomName}</Typography>
                <Box display="flex" gap={1}>
                    <Button variant="outlined" color={isAudioEnabled ? 'primary' : 'warning'} onClick={toggleAudio}>
                        {isAudioEnabled ? 'Mute Audio' : 'Unmute Audio'}
                    </Button>
                    <Button variant="outlined" color={isVideoEnabled ? 'primary' : 'warning'} onClick={toggleVideo}>
                        {isVideoEnabled ? 'Turn Video Off' : 'Turn Video On'}
                    </Button>
                    <Button variant="contained" color="error" onClick={onLeave}>
                        Leave Room
                    </Button>
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 2,
                    width: '100%',
                }}
            >
                <VideoContainer elevation={3}>
                    <Typography variant="subtitle1" gutterBottom>You</Typography>
                    <VideoFrame ref={localVideoRef} />
                </VideoContainer>

                {participants.map((participant) => (
                    <Participant key={participant.sid} participant={participant} />
                ))}
            </Box>
        </Box>
    );
}

function Participant({ participant }: { participant: RemoteParticipant }) {
    const [videoTracks, setVideoTracks] = useState<(RemoteTrack | null)[]>([]);
    const [audioTracks, setAudioTracks] = useState<(RemoteTrack | null)[]>([]);
    const videoRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const trackSubscribed = (track: RemoteTrack) => {
            if (track.kind === 'video') {
                setVideoTracks((prev) => [...prev, track]);
            } else if (track.kind === 'audio') {
                setAudioTracks((prev) => [...prev, track]);
            }
        };

        const trackUnsubscribed = (track: RemoteTrack) => {
            if (track.kind === 'video') {
                setVideoTracks((prev) => prev.filter((t) => t !== track));
            } else if (track.kind === 'audio') {
                setAudioTracks((prev) => prev.filter((t) => t !== track));
            }
        };

        participant.on('trackSubscribed', trackSubscribed);
        participant.on('trackUnsubscribed', trackUnsubscribed);

        participant.tracks.forEach((publication) => {
            if (publication.isSubscribed && publication.track) {
                trackSubscribed(publication.track);
            }
        });

        return () => {
            setVideoTracks([]);
            setAudioTracks([]);
            participant.removeAllListeners();
        };
    }, [participant]);

    useEffect(() => {
        const videoTrack = videoTracks[0] as import('twilio-video').VideoTrack;
        if (videoTrack && videoRef.current) {
            const el = videoTrack.attach();
            videoRef.current.innerHTML = '';
            videoRef.current.appendChild(el);
            return () => {
                videoTrack.detach().forEach((el) => el.remove());
            };
        }
    }, [videoTracks]);

    useEffect(() => {
        const audioTrack = audioTracks[0] as import('twilio-video').AudioTrack;
        if (audioTrack && audioRef.current) {
            const el = audioTrack.attach();
            audioRef.current.innerHTML = '';
            audioRef.current.appendChild(el);
            return () => {
                audioTrack.detach().forEach((el) => el.remove());
            };
        }
    }, [audioTracks]);

    return (
        <VideoContainer elevation={3}>
            <Typography variant="subtitle1" gutterBottom>{participant.identity}</Typography>
            <VideoFrame ref={videoRef} />
            <div ref={audioRef} style={{ display: 'none' }} />
        </VideoContainer>
    );
}
