import { Mail, MessageSquare, Users, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface NotificationsStepProps {
  emailCandidate: boolean;
  onEmailCandidateChange: (value: boolean) => void;
  emailInterviewers: boolean;
  onEmailInterviewersChange: (value: boolean) => void;
  smsReminder: boolean;
  onSmsReminderChange: (value: boolean) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

export function NotificationsStep({
  emailCandidate,
  onEmailCandidateChange,
  emailInterviewers,
  onEmailInterviewersChange,
  smsReminder,
  onSmsReminderChange,
  notes,
  onNotesChange,
}: NotificationsStepProps) {
  return (
    <div className="space-y-6">
      {/* Notification Toggles */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Notification Settings</Label>
        
        <div className="space-y-3">
          {/* Email Candidate */}
          <div
            className={cn(
              'flex items-center justify-between p-4 rounded-lg border transition-colors',
              emailCandidate ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                emailCandidate ? 'bg-primary/10' : 'bg-secondary'
              )}>
                <Mail className={cn('h-4 w-4', emailCandidate ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email Candidate</p>
                <p className="text-xs text-muted-foreground">Send interview invitation to candidate</p>
              </div>
            </div>
            <Switch
              checked={emailCandidate}
              onCheckedChange={onEmailCandidateChange}
              aria-label="Email candidate"
            />
          </div>

          {/* Email Interviewers */}
          <div
            className={cn(
              'flex items-center justify-between p-4 rounded-lg border transition-colors',
              emailInterviewers ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                emailInterviewers ? 'bg-primary/10' : 'bg-secondary'
              )}>
                <Users className={cn('h-4 w-4', emailInterviewers ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email Interviewers</p>
                <p className="text-xs text-muted-foreground">Notify interviewers about the session</p>
              </div>
            </div>
            <Switch
              checked={emailInterviewers}
              onCheckedChange={onEmailInterviewersChange}
              aria-label="Email interviewers"
            />
          </div>

          {/* SMS Reminder */}
          <div
            className={cn(
              'flex items-center justify-between p-4 rounded-lg border transition-colors',
              smsReminder ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                smsReminder ? 'bg-primary/10' : 'bg-secondary'
              )}>
                <MessageSquare className={cn('h-4 w-4', smsReminder ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">SMS Reminder</p>
                <p className="text-xs text-muted-foreground">Send reminder 1 hour before interview</p>
              </div>
            </div>
            <Switch
              checked={smsReminder}
              onCheckedChange={onSmsReminderChange}
              aria-label="SMS reminder"
            />
          </div>
        </div>
      </div>

      {/* Email Preview */}
      {(emailCandidate || emailInterviewers) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Email Template Preview</Label>
          </div>
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <p className="text-sm text-foreground font-medium mb-2">Subject: Interview Scheduled - [Role]</p>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>Dear [Name],</p>
              <p>
                We're pleased to inform you that your interview has been scheduled for{' '}
                <span className="text-foreground font-medium">[Date]</span> at{' '}
                <span className="text-foreground font-medium">[Time]</span>.
              </p>
              <p>
                Interview Mode: <span className="text-foreground font-medium">[Mode]</span>
                <br />
                Duration: <span className="text-foreground font-medium">[Duration]</span>
              </p>
              <p className="text-muted-foreground/70 italic">
                [Meeting link or location will be included automatically]
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Internal Notes</Label>
        <Textarea
          placeholder="Add any notes for the interview panel (not shared with candidate)..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-[100px] bg-background resize-none"
        />
        <p className="text-xs text-muted-foreground">
          These notes will be visible to interviewers only
        </p>
      </div>
    </div>
  );
}
