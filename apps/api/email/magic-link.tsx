import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Tailwind,
  Hr,
  Text,
} from '@react-email/components';

interface MagicLinkEmailProps {
  loginCode?: string;
}

export const MagicLinkEmail = ({ loginCode }: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Log in with this magic link</Preview>
    <Tailwind>
      <Body className="bg-white">
        <Container className="px-3 mx-auto">
          <Text className="text-black text-[24px] font-bold p-0 my-[30px] mx-0 font-sans">
            Login
          </Text>
          <Link
            href="https://.so"
            target="_blank"
            className="block text-blue-600 underline mb-4"
          >
            Click here to log in with this magic link
          </Link>
          <Text className="text-gray-800 mb-3.5">
            Or, copy and paste this temporary login code:
          </Text>
          <code className="block bg-gray-200 rounded px-2 py-4 border border-gray-300 text-gray-800 mb-3.5">
            {loginCode}
          </code>
          <Text className="text-gray-500 mb-4">
            If you didn&apos;t try to login, you can safely ignore this email.
          </Text>
          <Text className="text-gray-500 mb-9.5">
            Hint: You can set a permanent password in Settings→ My account.
          </Text>
          <Hr className="border-gray-200 my-4" />
          <Link href={'localhost:3000'} className="text-xs text-gray-400">
            Bookshelf
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

MagicLinkEmail.PreviewProps = {
  loginCode: 'sparo-ndigo-amurt-secan',
} as MagicLinkEmailProps;

export default MagicLinkEmail;
