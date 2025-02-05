import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { ReadDateService } from './read-date.service';
import {
  PROGRESS_TYPE,
  ReadDate,
  ReadingProgress,
} from '@bookshelf/api/generated-db-types';
import { Prisma } from '@prisma/client';

@Resolver(() => ReadDate)
export class ReadDateResolver {
  constructor(private readonly readDateService: ReadDateService) {}

  @Query(() => [ReadDate])
  async readDates(
    @Args('userBookIds', { type: () => [String] }) userBookIds: string[],
    @Args('active', { type: () => Boolean, nullable: true }) active?: boolean,
  ) {
    const where: Prisma.ReadDateWhereInput = {
      userBookId: {
        in: userBookIds,
      },
    };

    if (active !== undefined) {
      where.active = active;
    }

    const readDates = await this.readDateService.findMany({
      where,
      include: {
        readingProgress: true,
      },
    });

    return readDates;
  }
  @Mutation(() => ReadDate)
  async updateReadDate(
    @Args('id') id: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('finishedDate', { nullable: true }) finishedDate?: string,
  ) {
    const updateData: Prisma.ReadDateUpdateInput = {};

    if (startDate) {
      updateData.startDate = this.convertToDate(startDate);
    }

    if (finishedDate) {
      updateData.finishedDate = this.convertToDate(finishedDate);
      updateData.active = false; // Assuming the read is finished when finishedDate is set
    }

    return this.readDateService.update({
      where: { id },
      data: updateData,
    });
  }

  @Mutation(() => ReadingProgress)
  async updateReadingProgress(
    @Args('readingProgressId') readingProgressId: string,
    @Args('type') type: PROGRESS_TYPE,
    @Args('capacity', { type: () => Int, nullable: true }) capacity: number,
    @Args('progress', { type: () => Int }) progress: number,
  ) {
    return this.readDateService.updateProgress({
      where: { id: readingProgressId },
      data: {
        type,
        capacity,
        progress,
      },
    });
  }

  private convertToDate(dateString: string): Date {
    const [month, day, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date
  }
}
