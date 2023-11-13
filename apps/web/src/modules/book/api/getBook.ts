import { processBook } from "@/lib/utils";
import { BookData } from "@/types/interfaces";
import axios from "axios";

export async function getBook(bookId: string) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${process.env.GOOGLE_BOOKS_API_KEY}`;
    const response = await axios.get(url);

    // Check if the response status is successful (status code 2xx)
    if (response.status >= 200 && response.status < 300) {
      const book: BookData = response.data; // Assuming response.data contains the book data
      const processedBook: BookData = processBook(book) as BookData;
      return processedBook;
    } else {
      // Handle non-successful response status codes (4xx, 5xx, etc.) if needed
      return null;
    }
  } catch (error) {
    // Handle Axios errors here
    console.error("Error fetching book:", error);
    return null;
  }
}
