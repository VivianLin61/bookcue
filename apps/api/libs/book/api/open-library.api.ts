import { SOURCE } from '@bookshelf/api/generated-db-types';
import { BookData, GoodreadsBook } from 'libs/user-book/types';
import axiosInstance from 'src/config/axios.config';
export async function getOpenLibraryBook(book: GoodreadsBook) {
  // Attempt to find by ISBN 10
  try {
    const openlibraryIsbn10Book = await getBookByOpenLibraryISBN(book.ISBN);
    if (openlibraryIsbn10Book) return openlibraryIsbn10Book;
  } catch (error) {
    console.error('Error finding by ISBN 10:', error.message);
  }

  // If ISBN 10 failed or didn't return a book, try ISBN 13
  try {
    const openlibraryIsbn13Book = await getBookByOpenLibraryISBN(book.ISBN13);
    if (openlibraryIsbn13Book) return openlibraryIsbn13Book;
  } catch (error) {
    console.error('Error finding by ISBN 13:', error.message);
  }

  // If both ISBN lookups failed, try a query with the title and authors
  try {
    const openlibraryQueryBook = await findBookByOpenLibraryQuery(
      `${book.Title} ${book.Author}`,
    );
    if (openlibraryQueryBook) return openlibraryQueryBook;
  } catch (error) {
    console.error('Error finding by Open Library query');
  }

  // If all attempts fail, return null or handle accordingly
  return null;
}
export async function findBookByOpenLibraryQuery(query) {
  try {
    // Sorts by relevance by default try sort by readinglong_count populairty
    // https://openlibrary.org/search.json?title=the+lord&author=tolkien&sort=readinglog_count
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(
      query,
    )}`;
    const searchResponse = await axiosInstance.get(searchUrl);
    if (searchResponse.status >= 200 && searchResponse.status < 300) {
      const books = searchResponse.data.docs;
      if (books.length > 0 && books[0].cover_edition_key) {
        // Fetch details of the book using its cover edition key
        const bookDetails = await getBookByOpenLibraryBookId(
          books[0].cover_edition_key,
        );
        return bookDetails;
      } else {
        console.log(
          'No books found for the query or missing cover edition key.',
        );
        return null;
      }
    } else {
      console.error(
        'Non-successful response status from search:',
        searchResponse.status,
      );
      return null;
    }
  } catch (error) {
    console.error('Error during search or fetching cover details');
    return null;
  }
}

// Works API

async function getBookByOpenLibraryWorkId(workId) {
  try {
    const url = `https://openlibrary.org/works/${workId}.json`;
    const response = await axiosInstance.get(url);
    if (response.status >= 200 && response.status < 300) {
      return response.data; // Return the book details
    } else {
      console.error('Non-successful response status:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching book details');
    return null;
  }
}

// ISBN API
export async function getBookByOpenLibraryISBN(isbn) {
  if (isbn == '') {
    return null;
  }
  try {
    const url = `https://openlibrary.org/isbn/${isbn}.json`;
    const response = await axiosInstance.get(url);
    if (response.status >= 200 && response.status < 300) {
      const bookDetails = response.data;
      if (!(bookDetails.works.length > 0)) {
        return null;
      }
      const workId: string = bookDetails.works[0].key.replace('/works/', ''); // Open Library IDs are in the form /works/OL123M
      const workDetails = await getBookByOpenLibraryWorkId(workId);

      const processedBook: BookData = processOpenLibraryBook(
        bookDetails,
        workDetails,
      ) as BookData;
      // Process book here into book data
      return processedBook;
    } else {
      console.error('Non-successful response status:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching open library book details');
    return null;
  }
}

// Books API
async function getBookByOpenLibraryBookId(bookId) {
  try {
    const url = `https://openlibrary.org/books/${bookId}.json`;
    const response = await axiosInstance.get(url);
    if (response.status >= 200 && response.status < 300) {
      const bookDetails = response.data;
      const workId: string = bookDetails.works[0].key.replace('/works/', ''); // Open Library IDs are in the form /works/OL123M
      const workDetails = await getBookByOpenLibraryWorkId(workId);

      const processedBook: BookData = processOpenLibraryBook(
        bookDetails,
        workDetails,
      ) as BookData;
      // Process book here into book data
      return processedBook;
    } else {
      console.error('Non-successful response status:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error fetching open library book details');
    return null;
  }
}

export function processOpenLibraryBook(book: any, work: any): BookData | null {
  if (!book || !work) return null;
  const title = book.title ?? '';
  const subtitle = book.subtitle ?? '';
  const averageRating = book.averageRating ?? 0;
  const yearPublished = book.publish_date ?? '';
  const publisher = book.publishers ? book.publishers[0] : '';
  const pageCount = book.number_of_pages ?? 0;
  const isbn10 = book.isbn_10 ?? '';
  const isbn13 = book.isbn_13 ?? '';

  const imageLinks = {
    small: book.covers
      ? `http://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`
      : '',
    medium: book.covers
      ? `http://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
      : '',
    large: book.covers
      ? `http://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
      : '',
  };

  const description: string = work.description
    ? typeof work.description === 'string'
      ? work.description
      : work.description.value
    : '';

  const language: string = book.languages
    ? book.languages[0].key.replace('/languages/', '')
    : '';

  const id = book.key.replace('/books/', '');
  const source = SOURCE.OPEN_LIBRARY;

  const bookData: BookData = {
    id,
    title,
    subtitle,
    averageRating,
    yearPublished,
    publisher,
    source,
    imageLinks,
    language,
    description,
    pageCount,
    isbn10,
    isbn13,
  };

  return bookData;
}
