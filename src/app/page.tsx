'use client';
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import Box from '@mui/material/Box';

// Icons
import PhoneIcon from '@mui/icons-material/Phone';
import SmsIcon from '@mui/icons-material/Sms';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ChatIcon from '@mui/icons-material/Chat';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import HistoryIcon from '@mui/icons-material/History';

const features = [
  {
    title: 'Voice Calls',
    description: 'Make and receive calls, server-originated calls, and recordings.',
    icon: <PhoneIcon fontSize="large" color="primary" />,
    href: '/voice',
    action: 'Go to Voice',
  },
  {
    title: 'SMS / MMS',
    description: 'Send SMS/MMS and receive messages via webhook.',
    icon: <SmsIcon fontSize="large" color="secondary" />,
    href: '/sms',
    action: 'Go to SMS',
  },
  {
    title: 'IVR System',
    description: 'Interactive Voice Response with Gather menu and voicemail.',
    icon: <RecordVoiceOverIcon fontSize="large" color="success" />,
    href: '/ivr',
    action: 'Go to IVR',
  },
  {
    title: 'Video Rooms',
    description: 'Join programmable video rooms with token generation.',
    icon: <VideoCallIcon fontSize="large" color="warning" />,
    href: '/video',
    action: 'Go to Video',
  },
  {
    title: 'Live Chat',
    description: 'Real-time chat between users with shareable URLs.',
    icon: <ChatIcon fontSize="large" color="info" />,
    href: '/chat',
    action: 'Go to Chat',
  },
  {
    title: 'System Logs',
    description: 'View recent webhook activity and system logs.',
    icon: <HistoryIcon fontSize="large" color="action" />,
    href: '/logs',
    action: 'View Logs',
  },
];

export default function Page() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 3,
        }}
      >
        {features.map((feature) => (
          <Card
            key={feature.title}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: '0.3s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {feature.icon}
              </Box>
              <Typography gutterBottom variant="h5" component="div" align="center">
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {feature.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button component={Link} href={feature.href} variant="contained" size="small">
                {feature.action}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> This demo showcases Twilio capabilities. Ensure compliance with local regulations (e.g., TRAI for India) when using real numbers. State is ephemeral.
        </Typography>
      </Box>
    </Box>
  );
}
