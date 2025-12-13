import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { SetWorkingHoursDto, WeeklyPatternDto } from '../dto';
import { AvailabilityService } from './availability.service';

@Injectable()
export class WorkingHoursService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AvailabilityService))
        private availabilityService: AvailabilityService,
    ) { }

    /**
     * Get working hours for a user
     */
    async getWorkingHours(tenantId: string, userId: string) {
        const workingHours = await this.prisma.workingHours.findFirst({
            where: {
                tenantId,
                userId,
                OR: [
                    { effectiveTo: null },
                    { effectiveTo: { gte: new Date() } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });

        return workingHours;
    }

    /**
     * Set working hours for a user (creates or updates)
     */
    async setWorkingHours(
        tenantId: string,
        currentUserId: string,
        dto: SetWorkingHoursDto,
    ) {
        const userId = dto.userId || currentUserId;

        // Validate weekly pattern
        this.validateWeeklyPattern(dto.weekly);

        // Check if user belongs to tenant
        const userTenant = await this.prisma.userTenant.findFirst({
            where: { tenantId, userId },
        });

        if (!userTenant) {
            throw new NotFoundException('User not found in this tenant');
        }

        // Upsert working hours
        const existing = await this.prisma.workingHours.findFirst({
            where: { tenantId, userId },
        });

        if (existing) {
            const updated = await this.prisma.workingHours.update({
                where: { id: existing.id },
                data: {
                    weekly: dto.weekly as any,
                    timezone: dto.timezone,
                    effectiveFrom: dto.effectiveFrom
                        ? new Date(dto.effectiveFrom)
                        : null,
                    effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
                },
            });
            // Invalidate cache
            await this.availabilityService.invalidateUserCache(tenantId, userId);
            return updated;
        }

        const created = await this.prisma.workingHours.create({
            data: {
                tenantId,
                userId,
                weekly: dto.weekly as any,
                timezone: dto.timezone,
                effectiveFrom: dto.effectiveFrom
                    ? new Date(dto.effectiveFrom)
                    : null,
                effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
            },
        });
        // Invalidate cache
        await this.availabilityService.invalidateUserCache(tenantId, userId);
        return created;
    }

    /**
     * Get default working hours pattern (Mon-Fri 9am-5pm)
     */
    getDefaultPattern(timezone: string = 'UTC'): WeeklyPatternDto[] {
        return [
            { dow: 1, start: '09:00', end: '17:00' }, // Monday
            { dow: 2, start: '09:00', end: '17:00' }, // Tuesday
            { dow: 3, start: '09:00', end: '17:00' }, // Wednesday
            { dow: 4, start: '09:00', end: '17:00' }, // Thursday
            { dow: 5, start: '09:00', end: '17:00' }, // Friday
        ];
    }

    private validateWeeklyPattern(weekly: WeeklyPatternDto[]) {
        for (const pattern of weekly) {
            if (pattern.dow < 0 || pattern.dow > 6) {
                throw new Error(`Invalid day of week: ${pattern.dow}`);
            }

            const startParts = pattern.start.split(':').map(Number);
            const endParts = pattern.end.split(':').map(Number);

            if (
                startParts.length !== 2 ||
                endParts.length !== 2 ||
                isNaN(startParts[0]) ||
                isNaN(startParts[1]) ||
                isNaN(endParts[0]) ||
                isNaN(endParts[1])
            ) {
                throw new Error('Invalid time format. Use HH:mm');
            }

            const startMins = startParts[0] * 60 + startParts[1];
            const endMins = endParts[0] * 60 + endParts[1];

            if (endMins <= startMins) {
                throw new Error('End time must be after start time');
            }
        }
    }
}
