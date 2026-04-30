import React from 'react';
import { IconCheck, IconInfoCircle, IconPlus } from '@tabler/icons-react';
import {
  AlertCircleIcon,
  ArrowUpIcon,
  CheckCircle2Icon,
  InfoIcon,
  MailIcon,
  Search,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getLink, createLink } from '../create/actions/link-actions';
import ImageCropper from './ImageCropper';
import { useRouter } from 'next/navigation';

type FormProps = {
  title: string;
  image: string;
  description: string;
};
interface LinkFormProps {
  intitialData?: FormProps;
  onSubmit?: (data: FormProps) => void;
  buttonLabel?: string;
  title?: string;
  onTitleChange?: (title: string) => void;
  description?: string;
  onDescriptionChange?: (description: string) => void;
  onImageChange?: (image: string) => void;
  urlDomain?: string;
  onUrlDomainChange?: (urlDomain: string) => void;
  image?: string;
}
export default function FormLink({
  intitialData,
  onSubmit,
  buttonLabel,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  urlDomain,
  onUrlDomainChange,
  onImageChange,
  image
}: LinkFormProps) {
  const [currentLength, setCurrentLength] = React.useState(description ? description.length : 0);
  const [loading, setLoading] = React.useState(false);
  const [checkURL, setCheckURL] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState('');
  const [ogData, setOgData] = React.useState<{
    item_id: number;
    shop_id: number;
    title: string;
    description: string;
    image: string;
    url: string;
    price: number;
    currency: string;
    stock: number;
    sold: number;
    site_domain?: string;
    site_name?: string;
    type?: 'image' | 'video' | 'article' | 'website';
  } | null>(null);
  
  const router = useRouter();

  const handleCheckURL = async (url: string) => {
    setCheckURL(false);
    setLoading(true);
    // Simulate URL checking logic
    const result = await getLink(url)
    console.log("client response", result);

    setTimeout(() => {
      setCheckURL(true);
      setLoading(false);

      const newOgData = {
        item_id: 23022109422,
        shop_id: 218101998,
        title: result?.title ?? 'No title available',
        description: result?.description ?? 'No description available',
        image: result?.image ?? 'https://cf.shopee.co.id/file/abc12345xyz',
        url: result?.url ?? urlInput,
        price: 499000, // asumsi dalam Rupiah
        currency: 'IDR',
        stock: 50, // asumsi
        sold: 120, // asumsi
        site_name: result?.siteName ?? '',
        site_domain: result?.displayUrl ?? '',
        type: result?.type,
      };

      setOgData(newOgData);

      // Update preview immediately
      if (onTitleChange) onTitleChange(newOgData.title);
      if (onDescriptionChange) {
        onDescriptionChange(newOgData.description);
        setCurrentLength(newOgData.description.length);
      }
      if (onImageChange) onImageChange(newOgData.image);
      if (onUrlDomainChange) onUrlDomainChange(newOgData.site_domain!);

    }, 1000);
  };
  const handleCharacterLimit = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const maxLength = 120;

    let value = event.target.value;
    if (value.length >= maxLength) {
      value = value.slice(0, maxLength);
    }

    setCurrentLength(value.length);
    if (onDescriptionChange) {
      onDescriptionChange(value);
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onTitleChange) {
      onTitleChange(event.target.value);
    }
  };

  const handleUrlDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onUrlDomainChange) {
      onUrlDomainChange(event.target.value);
    }
  };

  const handleSubmit = async () => {
    if (!ogData) {
      alert('Please search for a URL first');
      return;
    }
    
    setLoading(true);
    try {
      const customData = {
        title: title || ogData.title,
        description: description || ogData.description,
        image: ogData.image
      };
      
      const res = await createLink({
        title: title || ogData.title,
        description: description || ogData.description,
        image: image || ogData.image, 
      }, ogData as any);
      
      if (res.success) {
        alert('Link successfully created!');
        router.push('/dashboard/links');
      } else {
        alert(res.error || 'Failed to create link');
      }
    } catch (error: unknown) {
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='flex justify-center flex-col gap-4'>
        <InputGroup>
          <InputGroupInput placeholder='Enter URL...'
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          {loading && (
            <InputGroupAddon align='inline-end'>
              <IconPlus className='animate-spin' />
            </InputGroupAddon>
          )}
          {checkURL && (
            <InputGroupAddon align='inline-end'>
              <IconCheck className='text-green-500!' />
            </InputGroupAddon>
          )}
          <InputGroupAddon align='inline-end'>
            <InputGroupButton
              type='button'
              variant='secondary'
              onClick={() => handleCheckURL(urlInput)}
              disabled={loading}
            >
              Search
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <Separator />
        {checkURL && (
          <Alert
            variant='default'
            className='mb-4 border-green-500! bg-[repeating-linear-gradient(135deg,#e5e7eb_0,#e5e7eb_1px,transparent_1px,transparent_8px)] shadow-xl'
          >
            <AlertTitle className='text-green-500!'>
              <CheckCircle2Icon className='text-green-500! inline-block' />{' '}
              Success! Your url have been checked.
            </AlertTitle>
            <AlertDescription>
              <p>Please check your field below.</p>
              <ul className='list-inside list-disc text-sm'>
                <li>{ogData?.title}</li>
                <li>{ogData?.item_id}</li>
                <li>{ogData?.shop_id}</li>
                <li>{ogData?.url.slice(0, 50)}</li>
                <li>{ogData?.price}</li>
                <li>{ogData?.currency}</li>
                <li>{ogData?.description}</li>
                <li>{ogData?.site_name}</li>
                <li>{ogData?.site_domain}</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <Separator className='animate-pulse ' />
        <h2 className='text-slate-900 font-semibold align-middle'>
          <InfoIcon className='w-6! h-6! me-1.5 inline-block' /> Check and
          Adjust Your Best Details
        </h2>
        <InputGroup className='mb-0!'>
          <InputGroupInput
            id='title'
            type='text'
            placeholder='Enter your title'
            value={title || ''}
            onChange={handleTitleChange}
          />
          <InputGroupAddon align='inline-end'>
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton className='rounded-full' size='icon-xs'>
                  <IconInfoCircle />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>This is content in a tooltip.</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput
            placeholder='example.com'
            className='pl-11'
            onChange={handleUrlDomainChange}
            value={urlDomain || ''} />
          <InputGroupAddon>
            <Label htmlFor='domain' className='text-foreground me-2'>
              Domain
            </Label>
            <InputGroupText id='domain'>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupAddon align='inline-end'>
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton className='rounded-full' size='icon-xs'>
                  <IconInfoCircle />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>This is content in a tooltip.</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>

        <InputGroup>
          <InputGroupTextarea
            placeholder='Enter your message'
            value={description || ''}
            onChange={handleCharacterLimit}
            maxLength={120}
          />
          <InputGroupAddon align='block-end'>
            <InputGroupText
              className={
                currentLength > 110
                  ? 'text-red-500 text-xs'
                  : 'text-muted-foreground text-xs'
              }
            >
              {currentLength}/{120 - currentLength} characters left
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>

        {/* Image Cropper */}
        <div className="mt-2 w-full">
          <Label className='text-slate-900 font-semibold mb-2 block'>
            Custom Image (Optional)
          </Label>
          <ImageCropper
            onImageCropped={(croppedUrl) => {
              if (onImageChange) onImageChange(croppedUrl);
            }}
            initialImage={ogData?.image}
          />
        </div>
      </div>
      <div className='flex justify-end mt-4 gap-2'>
        <button 
          className='bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition'
          onClick={() => router.push('/dashboard/links')}
        >
          Cancel
        </button>
        <button 
          className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50'
          onClick={handleSubmit}
          disabled={loading || !checkURL}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </>
  );
}
