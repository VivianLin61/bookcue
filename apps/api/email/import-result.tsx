import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Button,
  Preview,
  Tailwind,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface ImportSummaryEmailProps {
  totalBooks: string;
  successBooks: string;
  failedBooks: string;
  username: string;
  importId: string;
  summaryLink: string;
}

export const ImportSummaryEmail = ({
  totalBooks,
  successBooks,
  failedBooks,
  summaryLink,
  username,
  importId,
}: ImportSummaryEmailProps) => (
  <Html>
    <Head />
    <Preview>Book Import #{importId} Completed</Preview>
    <Tailwind>
      <Body className="bg-white font-sans px-2">
        <Container className="px-3 mx-auto">
          <Text className="text-black text-[24px] font-bold p-0 my-[30px] mx-0 font-sans">
            Book Import #{importId} Completed
          </Text>
          <Text>Hey {username},</Text>
          <Text className="text-gray-800">
            We finished importing your books. For detailed insights, please
            visit the import summary page.
          </Text>
          <Container>
            <Text className="mt-0">
              Here's a quick summary of the import results:
            </Text>

            <Text className="m-0 font-bold">
              Total Books: <span className="font-normal">{totalBooks}</span>
            </Text>
            <Text className="m-0 font-bold">
              Successfully imported books:{' '}
              <span className="font-normal">{successBooks}</span>
            </Text>
            <Text className="m-0 font-bold">
              Failed imported books:{' '}
              <span className="font-normal">{failedBooks}</span>
            </Text>
          </Container>

          <Section className="mt-4">
            <Button className="bg-[#4e3b2c] cursor-pointer rounded text-white text-sm font-medium px-4 py-3">
              View Import Summary
            </Button>
          </Section>

          <Hr className="border-gray-200 my-4" />
          <Link href={summaryLink} className="text-xs text-gray-400">
            Bookshelf
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

ImportSummaryEmail.PreviewProps = {
  username: 'Vivian',
  totalBooks: '100',
  successBooks: '103',
  failedBooks: '4',
  importId: '12',
  summaryLink: 'https://localhost:3000',
} as ImportSummaryEmailProps;

export default ImportSummaryEmail;
