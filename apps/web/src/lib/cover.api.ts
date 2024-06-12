import axios from 'axios';

const START_PATTERN_GOODREADS_IMAGE_SEARCH =
  'https://images-na.ssl-images-amazon.com/images';
const START_PATTERN_GOODREADS_GOOGLE_SEARCH =
  'https://www.goodreads.com/book/show/';
const END_PATTERN_GOODREADS_GOOGLE_SEARCH = '&';
const END_PATTERN_IMAGE_SEARCH = '"';
const START_PATTERN_GOODREADS_RATING = '"';
const END_PATTERN_GOODREADS_RATING = '&';

function getUrl(data, startPattern, endPattern) {
  const startIndex = data.indexOf(startPattern);
  if (startIndex === -1) {
    throw new Error('Initial pattern not found');
  }
  ('');

  const endIndex = data.indexOf(endPattern, startIndex);
  if (endIndex === -1) {
    throw new Error('End pattern not found');
  }
  ('');
  return data.slice(startIndex, endIndex);
}

function getSmallImage(url) {
  if (url) {
    url = url.replace(
      'https://images-na.ssl-images-amazon.com/images/',
      'https://i.gr-assets.com/images/'
    );

    // Insert "._SY180_" before the file extension to get a smaller image
    const lastDotIndex = url.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      url = url.slice(0, lastDotIndex) + '._SY180_' + url.slice(lastDotIndex);
    }
  }

  return url;
}

export async function getGoodreadsCover(id: string) {
  const goodreadUrl = `https://www.goodreads.com/book/show/${id}`;
  const goodreadResponse = await axios.get(goodreadUrl);
  const imageUrl = getUrl(
    goodreadResponse.data,
    START_PATTERN_GOODREADS_IMAGE_SEARCH,
    END_PATTERN_IMAGE_SEARCH
  );
  return {
    small: getSmallImage(imageUrl),
    large: imageUrl,
  };
}

export async function getCovers({
  isbn,
  title,
  authors,
}: {
  isbn: string;
  title: string;
  authors: string[];
}) {
  if (isbn) {
    const cover = await bookcoverIsbn(isbn);

    const imageLinks = {
      small: getSmallImage(cover) || '',
      large: cover || '',
    };
    if (cover) {
      return imageLinks;
    }
  } else {
    if (title && authors.length > 0) {
      const cover = await bookcoverSearch(title, authors[0]);

      const imageLinks = {
        small: getSmallImage(cover) || '',
        large: cover || '',
      };
      if (cover) {
        return imageLinks;
      }
    }
  }
}

export async function bookcoverIsbn(isbn: string) {
  const searchUrl = `https://www.goodreads.com/search?utf8=✓&query=${isbn}`;

  try {
    const goodreadResponse = await axios.get(searchUrl);
    // console.log(goodreadResponse);
    const imageUrl = getUrl(
      goodreadResponse.data,
      START_PATTERN_GOODREADS_IMAGE_SEARCH,
      END_PATTERN_IMAGE_SEARCH
    );
    console.log(imageUrl);
    return imageUrl;
    // res.status(200).send(buildSuccessResponse(imageUrl));
  } catch (error) {
    // const ex = new HttpException(500, error.message);
    console.log(error + ' ' + isbn);
    return null;
    // res.status(ex.statusCode).send(buildErrorResponse(ex));
  }
}

export async function bookcoverSearch(bookTitle, authorName) {
  //   const bookTitle = '21 Lessons for the 21st Century';
  //   const authorName = 'Yuval Noah Harari';

  if (!bookTitle || !authorName) {
    // const ex = new HttpException(400, 'Mandatory parameters missing');
    // console.log(ex);
    return null;
  }

  const encodedBookTitle = encodeURIComponent(bookTitle);
  const encodedAuthorName = encodeURIComponent(authorName);
  const query = `${encodedBookTitle}+${encodedAuthorName}+site:goodreads.com/book/show`;
  const searchUrl = `https://www.google.com/search?q=${query}&sourceid=chrome&ie=UTF-8`;

  try {
    const searchResponse = await axios.get(searchUrl);

    const goodreadUrl = getUrl(
      searchResponse.data,
      START_PATTERN_GOODREADS_GOOGLE_SEARCH,
      END_PATTERN_GOODREADS_GOOGLE_SEARCH
    );
    console.log(searchUrl);
    const goodreadResponse = await axios.get(goodreadUrl);

    const imageUrl = getUrl(
      goodreadResponse.data,
      START_PATTERN_GOODREADS_IMAGE_SEARCH,
      END_PATTERN_IMAGE_SEARCH
    );
    return imageUrl;
    // res.status(200).send(buildSuccessResponse(imageUrl));
  } catch (error) {
    // const ex = new HttpException(500, error.message);
    console.log('ERROR' + bookTitle + ' ' + authorName);
    return null;
    // res.status(ex.statusCode).send(buildErrorResponse(ex));
  }

  //   http://bookcover.longitood.com/bookcover/978-0593135204
}
