import React from 'react'
import { Gallery, GalleryApi } from '@stefanoruth/react-gallery'
import classNames from 'classnames'

const images = ['/assets/image1.jpg', '/assets/image2.jpg', '/assets/image3.jpg']

export const App: React.FunctionComponent = () => {
    const gallery = React.useRef<GalleryApi>()
    const [slideIndex, setSlideIndex] = React.useState(0)
    const fixLint = !!gallery.current

    React.useEffect(() => {
        if (!gallery.current) {
            return
        }

        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                return gallery.current?.prev()
            }

            if (e.key === 'ArrowRight') {
                return gallery.current?.next()
            }
        }

        document.addEventListener('keydown', handler)

        return () => {
            document.removeEventListener('keydown', handler)
        }
    }, [fixLint])

    return (
        <div className="flex justify-center items-center bg-gray-300 min-h-screen">
            <div>
                <Gallery
                    className="bg-gray-400"
                    style={{ width: '600px', height: '450px' }}
                    api={api => (gallery.current = api)}
                    onSlideChange={index => setSlideIndex(index)}>
                    {images.map((image, i) => (
                        <div
                            key={i}
                            className={classNames(
                                'w-full h-full flex items-center',
                                i === 0 && 'bg-red-400',
                                i === 1 && 'bg-blue-400',
                                i === 2 && 'bg-green-400'
                            )}>
                            <div className="w-full h-full flex justify-center items-center">
                                <img
                                    src={image}
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    alt={image}
                                />
                            </div>
                        </div>
                    ))}
                </Gallery>
                <div className="flex justify-between mt-2">
                    <button className="p-4 bg-purple-400" onClick={() => gallery.current?.prev()}>
                        Prev
                    </button>
                    <div className="p-4">
                        <span>{slideIndex + 1}</span>/<span>{images.length}</span>
                    </div>
                    <button className="p-4 bg-purple-400" onClick={() => gallery.current?.next()}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
