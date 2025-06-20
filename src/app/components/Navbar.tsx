"use client";
import Link from 'next/link';
import Image from 'next/image';
import {auth} from "../api/auth";
import React from 'react';

const Navbar = () => {
    const session = await auth();
  return (
    <header className='px-5 py-3 bg-black shadow-sm font-work-sans'> 
        <nav className='flex justify-between items-centre'>
            <Link href="/">
                <Image src= "/agilePM-LT.svg" alt="AgilePM" width={144} height={20}/>
            </Link>

            <div className='flex items-center gap-5'>

            
            </div>
        </nav>
         
    </header>
  )
}

export default Navbar

// the / in links 