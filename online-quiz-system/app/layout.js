import './globals.css';

export const metadata = {
  title: 'QuizPro - Hệ thống thi trắc nghiệm trực tuyến',
  description: 'Nền tảng thi trắc nghiệm trực tuyến hiện đại cho giảng viên và sinh viên',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
