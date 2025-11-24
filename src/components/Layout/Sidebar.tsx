'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PhoneIcon from '@mui/icons-material/Phone';
import SmsIcon from '@mui/icons-material/Sms';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import HistoryIcon from '@mui/icons-material/History';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

const DRAWER_WIDTH = 280;

export default function Sidebar() {
    const pathname = usePathname();
    const [openChat, setOpenChat] = React.useState(true);

    const handleClickChat = () => {
        setOpenChat(!openChat);
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
            }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Placeholder for Logo */}
                <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1 }} />
                <Box sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Twilio Demo</Box>
            </Box>
            <Divider />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/" selected={pathname === '/'}>
                            <ListItemIcon><DashboardIcon /></ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItemButton>
                    </ListItem>

                    <Divider sx={{ my: 1 }} />

                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/sms" selected={pathname === '/sms'}>
                            <ListItemIcon><SmsIcon /></ListItemIcon>
                            <ListItemText primary="SMS / MMS" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/voice" selected={pathname === '/voice'}>
                            <ListItemIcon><PhoneIcon /></ListItemIcon>
                            <ListItemText primary="Voice Calls" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/ivr" selected={pathname === '/ivr'}>
                            <ListItemIcon><RecordVoiceOverIcon /></ListItemIcon>
                            <ListItemText primary="IVR System" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/video" selected={pathname === '/video'}>
                            <ListItemIcon><VideoCallIcon /></ListItemIcon>
                            <ListItemText primary="Video Rooms" />
                        </ListItemButton>
                    </ListItem>

                    {/* Collapsible Chat Menu */}
                    <ListItemButton onClick={handleClickChat}>
                        <ListItemIcon>
                            <ChatIcon />
                        </ListItemIcon>
                        <ListItemText primary="Live Chat" />
                        {openChat ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={openChat} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4 }} component={Link} href="/chat" selected={pathname === '/chat'}>
                                <ListItemText primary="Standard Chat" />
                            </ListItemButton>
                            {/* Placeholder for future chat variants */}
                            <ListItemButton sx={{ pl: 4 }} disabled>
                                <ListItemText primary="Flex Chat (Coming Soon)" />
                            </ListItemButton>
                        </List>
                    </Collapse>

                    <Divider sx={{ my: 1 }} />

                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/logs" selected={pathname === '/logs'}>
                            <ListItemIcon><HistoryIcon /></ListItemIcon>
                            <ListItemText primary="System Logs" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/settings" selected={pathname === '/settings'}>
                            <ListItemIcon><SettingsIcon /></ListItemIcon>
                            <ListItemText primary="Settings" />
                        </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemButton component={Link} href="/how-it-works" selected={pathname === '/how-it-works'}>
                            <ListItemIcon><InfoIcon /></ListItemIcon>
                            <ListItemText primary="How It Works" />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
}
