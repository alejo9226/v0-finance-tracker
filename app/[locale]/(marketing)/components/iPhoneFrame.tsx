import Image from 'next/image'

type iPhoneFrameProps = {
  src: string
  alt: string
  className?: string
  priority?: boolean
}

export default function IPhoneFrame({ src, alt, className = '', priority }: iPhoneFrameProps) {
  return (
    <div
      className={`relative flex justify-center md:justify-end ${className}`}
      aria-hidden
    >
      <div className="relative w-[70%] shrink-0 aspect-[390/844] sm:w-[300px] md:w-[260px]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 280px"
          className="object-contain object-top"
          priority={priority}
        />
      </div>
    </div>
  )
}
