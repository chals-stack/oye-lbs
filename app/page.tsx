'use client';
import dynamic from 'next/dynamic';
const Campus = dynamic(()=>import('./Campus'),{ssr:false,loading:()=> <div className="grid h-screen place-items-center">Le campus se prépare…</div>});
export default function Page(){return <Campus/>}
