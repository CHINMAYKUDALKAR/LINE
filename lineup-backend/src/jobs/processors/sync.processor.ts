import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("sync")
export class SyncProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    // Process sync
  }
}