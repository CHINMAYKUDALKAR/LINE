'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Smartphone, Send, Loader2, X } from 'lucide-react';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sendMessage, Channel } from '@/lib/api/communication';
import { toast } from 'sonner';

export type MessageChannel = 'EMAIL' | 'WHATSAPP' | 'SMS';

interface SendMessageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipientId: string;
    recipientName: string;
    recipientEmail?: string;
    recipientPhone?: string;
    defaultChannel?: MessageChannel;
}

const channelConfig: Record<MessageChannel, { icon: React.ElementType; label: string; color: string }> = {
    EMAIL: { icon: Mail, label: 'Email', color: 'text-blue-600' },
    WHATSAPP: { icon: WhatsAppIcon, label: 'WhatsApp', color: 'text-green-600' },
    SMS: { icon: Smartphone, label: 'SMS', color: 'text-purple-600' },
};

export function SendMessageDialog({
    open,
    onOpenChange,
    recipientId,
    recipientName,
    recipientEmail,
    recipientPhone,
    defaultChannel = 'EMAIL',
}: SendMessageDialogProps) {
    const [channel, setChannel] = useState<MessageChannel>(defaultChannel);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!body.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (channel === 'EMAIL' && !subject.trim()) {
            toast.error('Please enter a subject for the email');
            return;
        }

        if (channel === 'EMAIL' && !recipientEmail) {
            toast.error('Recipient does not have an email address');
            return;
        }

        if ((channel === 'WHATSAPP' || channel === 'SMS') && !recipientPhone) {
            toast.error('Recipient does not have a phone number');
            return;
        }

        setIsSending(true);
        try {
            await sendMessage({
                channel: channel as Channel,
                recipientType: 'CANDIDATE',
                recipientId,
                subject: channel === 'EMAIL' ? subject : undefined,
                body,
            });
            toast.success(`${channelConfig[channel].label} sent successfully!`);
            onOpenChange(false);
            setSubject('');
            setBody('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const resetForm = () => {
        setSubject('');
        setBody('');
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen) resetForm();
            onOpenChange(newOpen);
        }}>
            <DialogContent className="w-screen h-[100dvh] max-w-none sm:max-w-lg sm:h-auto sm:rounded-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Send Message to {recipientName}
                    </DialogTitle>
                    <DialogDescription>
                        Compose and send a message via your preferred channel.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Channel Tabs */}
                    <Tabs value={channel} onValueChange={(v) => setChannel(v as MessageChannel)}>
                        <TabsList className="grid grid-cols-3 w-full">
                            {(['EMAIL', 'WHATSAPP', 'SMS'] as MessageChannel[]).map((ch) => {
                                const config = channelConfig[ch];
                                const Icon = config.icon;
                                const disabled =
                                    (ch === 'EMAIL' && !recipientEmail) ||
                                    ((ch === 'WHATSAPP' || ch === 'SMS') && !recipientPhone);
                                return (
                                    <TabsTrigger
                                        key={ch}
                                        value={ch}
                                        disabled={disabled}
                                        className="gap-2"
                                    >
                                        <Icon className={`h-4 w-4 ${config.color}`} />
                                        {config.label}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        <TabsContent value="EMAIL" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="email-to">To</Label>
                                <Input
                                    id="email-to"
                                    value={recipientEmail || 'No email available'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email-subject">Subject</Label>
                                <Input
                                    id="email-subject"
                                    placeholder="Enter subject..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="WHATSAPP" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="wa-to">To</Label>
                                <Input
                                    id="wa-to"
                                    value={recipientPhone || 'No phone number available'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Message will be sent via WhatsApp Business API.
                            </p>
                        </TabsContent>

                        <TabsContent value="SMS" className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="sms-to">To</Label>
                                <Input
                                    id="sms-to"
                                    value={recipientPhone || 'No phone number available'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Message will be sent via Twilio SMS.
                            </p>
                        </TabsContent>
                    </Tabs>

                    {/* Message Body */}
                    <div className="space-y-2">
                        <Label htmlFor="message-body">Message</Label>
                        <Textarea
                            id="message-body"
                            placeholder="Type your message here..."
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={5}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {body.length} characters
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={isSending || !body.trim()}
                        className="gap-2"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Send {channelConfig[channel].label}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
