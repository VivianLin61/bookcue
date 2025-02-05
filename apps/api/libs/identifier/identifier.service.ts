import { Injectable } from '@nestjs/common';
import { PrismaRepository } from 'prisma/prisma.repository';
import {
  Identifier,
  IdentifierCreateInput,
  SOURCE,
} from '@bookshelf/api/generated-db-types';
import { Book } from '@prisma/client';

@Injectable()
export class IdentifierService {
  constructor(private readonly prisma: PrismaRepository) {}
  findFirst = this.prisma.identifier.findFirst;
  async createMany(data: IdentifierCreateInput[]): Promise<Identifier[]> {
    if (!data || data.length === 0) {
      return [];
    }

    try {
      // Step 1: Create identifiers using createMany with skipDuplicates
      await this.prisma.identifier.createMany({
        data: data.map((identifier) => ({
          source: identifier.source,
          sourceId: identifier.sourceId,
        })),
        skipDuplicates: true, // This will skip duplicates if any
      });
    } catch (error) {
      console.error('Error during createMany');
    }

    // Step 2: Query the data after the create
    const identifiers = await this.prisma.identifier.findMany({
      where: {
        OR: data.map((identifier) => ({
          source: identifier.source,
          sourceId: identifier.sourceId,
        })),
      },
    });

    return identifiers;
  }

  // Use source and sourceId to find the identifier
  async findBookByIdentifiers(identifiers: IdentifierCreateInput[]) {
    if (!identifiers || identifiers.length === 0) {
      return null;
    }

    for (const identifier of identifiers) {
      try {
        const existingIdentifier = await this.findFirst({
          where: {
            source: identifier.source,
            sourceId: identifier.sourceId,
          },
          include: {
            book: true,
          },
        });

        if (existingIdentifier && existingIdentifier.book) {
          return existingIdentifier.book;
        }
      } catch (error) {
        console.error('Error checking book by identifier:', error);
        return null;
      }
    }
    return null;
  }
}
