import React from 'react'
import { useGallery, Gallery } from '@stefanoruth/react-gallery'

const images = ['/assets/image1.jpg', '/assets/image2.jpg', '/assets/image3.jpg']

export const App: React.FunctionComponent = () => {
    const gallery = useGallery()

    console.log(gallery)

    return (
        <div className="flex justify-center items-center">
            <div>
                <Gallery controller={gallery} style={{ width: '600px', height: '450px' }}>
                    {images.map((image, i) => (
                        <div>
                            <img src={image} key={i} width={'100%'} alt={image} />
                        </div>
                    ))}
                </Gallery>
                <button onClick={gallery.prev}>Prev</button>
                <button onClick={gallery.next}>Next</button>
            </div>
        </div>
    )
}
