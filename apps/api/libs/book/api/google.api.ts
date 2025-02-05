import { SOURCE } from '@bookshelf/api/generated-db-types';
import { BookData, GoodreadsBook } from 'libs/user-book/types';
import axiosInstance from 'src/config/axios.config';

export async function getGoogleBook(book: GoodreadsBook) {
  try {
    const googleBook = await findGoogleBookByISBN(book.ISBN);
    if (googleBook) {
      return googleBook;
    }
  } catch (error) {
    console.error('Error finding by ISBN 10:', error.message);
  }
  try {
    const googleBook = await findGoogleBookByISBN(book.ISBN13);
    if (googleBook) {
      return googleBook;
    }
  } catch (error) {
    console.error('Error finding by ISBN 13:', error.message);
  }

  // If both ISBN lookups failed, try a query with the title and authors
  try {
    const googleBook = await findBookByGoogleQuery(
      `${book.Title} ${book.Author}`,
    );
    if (googleBook) {
      return googleBook;
    }
  } catch (error) {
    console.error('Error finding by Google query:', error.message);
  }

  // If all attempts fail, return null or handle accordingly
  return null;
}

export async function findBookByGoogleBookId(bookId: string) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes/${bookId}`;
    const response = await axiosInstance.get(url);
    // Check if the response status is successful (status code 2xx)
    if (response.status >= 200 && response.status < 300) {
      const book: BookData = response.data; // Assuming response.data contains the book data
      const processedBook: BookData = processGoogleBook(book) as BookData;

      return processedBook;
    } else {
      // Handle non-successful response status codes (4xx, 5xx, etc.) if needed
      return null;
    }
  } catch (error) {
    // Handle Axios errors here
    console.error('Error fetching book:', error);
    return null;
  }
}

export async function findGoogleBookByISBN(isbn: string) {
  if (isbn == '') {
    return null;
  }
  try {
    // https://developers.google.com/analytics/devguides/config/mgmt/v3/limits-quotas
    // Check if the number of requests exceeds the limit (10 requests per second)
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    const response = await axiosInstance.get(url);
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Check if the response status is successful (status code 2xx)
    if (response.status >= 200 && response.status < 300) {
      const data = response.data.items;

      if (data && data.length > 0) {
        const processedBook: BookData = processGoogleBook(data[0]) as BookData;
        //  also get user book if it exists
        return processedBook;
      }
    }
    // Handle non-successful response status codes (4xx, 5xx, etc.) if needed
    return null;
  } catch (error) {
    // Handle Axios errors here
    console.error('Error fetching book:', error);
    return null;
  }
}

export async function findBookByGoogleQuery(query: string) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}`;
    const response = await axiosInstance.get(url);
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Check if the response status is successful (status code 2xx)
    if (response.status >= 200 && response.status < 300) {
      const data = response.data.items;
      if (data.length > 0) {
        const fullBookUrl = `https://www.googleapis.com/books/v1/volumes/${data[0].id}`;
        const fullBook = await axiosInstance.get(fullBookUrl);
        const processedBook: BookData = processGoogleBook(
          fullBook.data,
        ) as BookData;
        return processedBook;
      }
    }
    // Handle non-successful response status codes (4xx, 5xx, etc.) if needed
    return null;
  } catch (error) {
    // Handle Axios errors here
    console.error('Error fetching book:', error);
    return null;
  }
}

export function processGoogleBook(book: any): BookData | null {
  const title: string = book.volumeInfo.title;
  const authors: string[] = book.volumeInfo.authors;
  // Skip processing the book if the title and author is already encountered
  const yearPublished: string = book.volumeInfo.publishedDate || 'N/A';
  const publisher: string = book.volumeInfo.publisher || 'N/A';
  const pageCount: number = book.volumeInfo.pageCount || 0;
  const averageRating: number = book.volumeInfo.averageRating || 0;
  let isbn10: string = 'N/A';
  let isbn13: string = 'N/A';
  if (book.volumeInfo.industryIdentifiers) {
    const identifier1 = book.volumeInfo.industryIdentifiers[0]?.identifier;
    const identifier2 = book.volumeInfo.industryIdentifiers[1]?.identifier;

    if (identifier1) isbn10 = identifier1;
    if (identifier2) isbn13 = identifier2;
  }
  const imageLinks = {
    small: book.volumeInfo.imageLinks?.thumbnail || '',
    large: book.volumeInfo.imageLinks?.large || '',
  };

  const description: string = book.volumeInfo.description || '';
  const allCategories =
    book.volumeInfo.categories?.flatMap((category: string) =>
      category.split(' / '),
    ) || [];
  const categories = allCategories.filter(
    (value: string, index: number, self: string[]) => {
      return self.indexOf(value) === index;
    },
  );
  const language = book.volumeInfo.language || '';
  const source = SOURCE.GOOGLE;
  const bookData: BookData = {
    id: book.id,
    title,
    source,
    authors,
    yearPublished,
    publisher,
    description,
    language,
    pageCount,
    isbn10,
    isbn13,
    averageRating,
    categories,
    imageLinks,
  };
  return bookData;
}
