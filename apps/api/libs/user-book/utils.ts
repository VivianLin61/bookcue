import { getGoogleBook } from 'libs/book/api/google.api';
import {
  GoodreadsBookKeys,
  GoodreadsBook,
  BookData,
  GoodreadsBookData,
} from './types';
import { getOpenLibraryBook } from 'libs/book/api/open-library.api';

import ShortUniqueId from 'short-uuid';
import { READING_STATUS, SOURCE } from '@bookshelf/api/generated-db-types';

export function getColumnData(csvContent, mappings) {
  // Split the CSV content into lines
  const lines = csvContent.split('\n');

  // Extract the data from the specified column
  const columnData = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parsedData = parseLineWithQuotes(line);
    const shelves = [];
    mappings.forEach((key: GoodreadsBookKeys, index) => {
      if (key === 'Bookshelves') {
        shelves.push(parsedData[index].split(',').map((shelf) => shelf.trim()));
      }
    });

    // if (line) {
    //   // Ignore empty lines
    //   const cells = line.split(',');
    //   columnData.push(cells[columnIndex]);
    // }
  }

  return;
}

function generateShortUUID(length: number): string {
  const translator = ShortUniqueId();
  const uuid = translator.new().substring(0, length);
  return uuid;
}

export function generateSlug(title: string): string {
  // Step 1: Convert the title to lowercase
  let slug = title.toLowerCase();

  // Step 2: Replace spaces and non-alphanumeric characters with hyphens
  slug = slug.replace(/[^a-z0-9]+/g, '-');

  // Step 3: Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Step 4: Append the unique identifier
  const id = generateShortUUID(6);
  slug = `${slug}-${id}`;

  return slug;
}

export function getShelves(objectFromCSV: GoodreadsBook) {
  let shelves: string[] = []; // get shelves
  if (objectFromCSV['Bookshelves']) {
    const cleanShelves = objectFromCSV['Bookshelves']
      .split(',')
      .map((shelf) => shelf.trim());
    const excludedShelves = ['to-read', 'currently-reading', 'read'];
    shelves = cleanShelves.filter((shelf) => !excludedShelves.includes(shelf));
  }
  return shelves;
}
export function getUserBookInfo(
  objectFromCSV: GoodreadsBook,
  ownedShelf: string,
  favoritesShelf: string,
) {
  let shelves: string[] = []; // get shelves
  if (objectFromCSV['Bookshelves']) {
    const cleanShelves = objectFromCSV['Bookshelves']
      .split(',')
      .map((shelf) => shelf.trim());
    const excludedShelves = ['to-read', 'currently-reading', 'read'];
    shelves = cleanShelves.filter((shelf) => !excludedShelves.includes(shelf));
    shelves = shelves.map((shelf) => {
      if (shelf === ownedShelf) {
        return 'Owned'; //owned shelf name
      } else if (shelf === favoritesShelf) {
        return 'Favorites'; //favorites shelf name
      } else {
        return shelf;
      }
    });
  }
  let status: READING_STATUS;
  if (objectFromCSV['Exclusive Shelf']) {
    if (objectFromCSV['Exclusive Shelf'] == 'to-read') {
      status = READING_STATUS.WANT_TO_READ;
    } else if (objectFromCSV['Exclusive Shelf'] == 'currently-reading') {
      status = READING_STATUS.READING;
    } else if (objectFromCSV['Exclusive Shelf'] == 'read') {
      status = READING_STATUS.FINISHED;
    }
  }

  let rating; // get rating
  if (objectFromCSV['My Rating']) {
    rating = objectFromCSV['My Rating'];
  }
  const dateString = objectFromCSV['Date Added'];

  const dateAdded = new Date(dateString);

  return { shelves, status, rating, dateAdded };
}
export function parseLineWithQuotes(csvContent: string) {
  const pattern = /(?:,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^",\r\n]*))/gi;
  const matches = csvContent.matchAll(pattern);
  const values = [];

  for (const match of matches) {
    const [, quotedValue, unquotedValue] = match;
    const value =
      quotedValue !== undefined
        ? quotedValue.replace(/""/g, '"')
        : unquotedValue;
    values.push(value ? value : '');
  }

  return values;
}

export function cleanText(text: string) {
  // Remove any non-alphanumeric characters from the
  const cleanText = text.replace(/[^a-zA-Z0-9]/g, '');
  return cleanText;
}

export const buildBook = (baseBook: GoodreadsBook): GoodreadsBookData => {
  const [title, subtitle] = baseBook['Title'].split(':');

  const trimmedTitle = title;
  const trimmedSubtitle = subtitle ?? undefined;
  let authors = [baseBook.Author];
  // Split the additional authors and concatenate them to the authors array
  const additionalAuthors = baseBook['Additional Authors']
    .split(',')
    .map((author) => author.trim())
    .filter((author) => author !== '');

  // Concatenate the filtered additional authors to the authors array
  authors = [...authors, ...additionalAuthors];

  return {
    id: baseBook['Book Id'],
    title: trimmedTitle,
    subtitle: trimmedSubtitle ?? undefined,
    yearPublished: baseBook['Year Published'] ?? undefined,
    rating: parseFloat(baseBook['Average Rating'] ?? '0'),
    authors: authors,
    pageCount: parseInt(baseBook['Number of Pages'] ?? '0', 10),
    isbn10: baseBook.ISBN ?? undefined,
    isbn13: baseBook.ISBN13 ?? undefined,
  };
};

export const processCSVLine = (line: string, mappings: GoodreadsBookKeys[]) => {
  const parsedData = parseLineWithQuotes(line);
  const goodreadsData = {};
  mappings.forEach((key: GoodreadsBookKeys, index) => {
    if (key === 'ISBN' || key === 'ISBN13') {
      goodreadsData[key] = cleanText(parsedData[index]);
    } else {
      goodreadsData[key] = parsedData[index];
    }
  });

  return goodreadsData as GoodreadsBook;
};
