import { useGetUserBooksLazyQuery } from '@/graphql/graphql';

const useLoadBooks = () => {
  const [loadBooks, { data: booksData, networkStatus }] =
    useGetUserBooksLazyQuery({
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
      onError: (error) => {
        // toast({
        //   title: error.message,
        //   variant: 'destructive',
        // });
      },
      onCompleted: (data) => {
        if (
          data &&
          data.getUserBooks.userBooks &&
          data.getUserBooks.userBooks?.length === 0
        ) {
        }
      },

      errorPolicy: 'all',
    });

  return {
    loadBooks,
    booksData,
    networkStatus,
  };
};

export default useLoadBooks;
