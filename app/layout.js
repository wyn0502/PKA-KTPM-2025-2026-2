import './globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'QuizPro - Hệ thống thi trắc nghiệm trực tuyến',
  description: 'Nền tảng thi trắc nghiệm trực tuyến hiện đại cho giảng viên và sinh viên',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
