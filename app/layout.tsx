import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'oye — Le campus fête Noël', description: 'Explore le campus de Noël et retrouve les cadeaux perdus.' };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="fr"><body>{children}</body></html>; }
