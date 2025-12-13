import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("reminder")
export class ReminderProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    // Process reminder
  }
}