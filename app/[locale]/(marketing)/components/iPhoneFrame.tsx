import Image from 'next/image'

const VIDEO_EXTENSIONS = ['.mp4', '.webm']

function isVideoSrc(src: string) {
  return VIDEO_EXTENSIONS.some((ext) => src.toLowerCase().endsWith(ext))
}

type iPhoneFrameProps = {
  src: string
  alt: string
  className?: string
  priority?: boolean
  poster?: string
}

export default function IPhoneFrame({ src, alt, className = '', priority, poster }: iPhoneFrameProps) {
  return (
    <div
      className={`relative flex justify-center md:justify-end ${className}`}
      aria-hidden
    >
      <div className="relative w-[70%] shrink-0 aspect-[390/844] sm:w-[300px] md:w-[260px]">
        {isVideoSrc(src) ? (
          <video
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-contain object-top"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 280px"
            className="object-contain object-top"
            priority={priority}
          />
        )}
      </div>
    </div>
  )
}
