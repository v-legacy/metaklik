'use client';
import React, { useState } from 'react';

import Preview from '../_components/Preview';
import FormLink from '../_components/FormLink';

type LinkData = {
  title: string;
  image: string;
  url: string;
  description: string;
};

export default function CreatePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState('');

  const handleCreateLink = async (data: LinkData) => { };

  return (
    <>
      <div className='flex flex-row max-h-screen'>
        <div className='flex flex-col w-full'>
          <h2 className='text-2xl font-bold'>Create Link</h2>
          <p>This is the create link page.</p>
        </div>
      </div>
      <div className='flex justify-center w-full p-4'>
        <div className='grid grid-cols-10 w-full gap-2'>
          <div className='col-span-7 w-full rounded-2xl shadow-lg p-6'>
            <FormLink
              title={title}
              onTitleChange={setTitle}
              description={description}
              onDescriptionChange={setDescription}
              urlDomain={url}
              onUrlDomainChange={setUrl}
              onImageChange={setImage}
              image={image}
            />
          </div>

          <div className='col-span-3 w-full p-6 rounded-2xl shadow-lg'>
            <Preview title={title} description={description} domain={url} image={image} />
          </div>
        </div>
      </div>
    </>
  );
}
