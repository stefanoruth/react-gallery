import React from 'react'
import { Gallery } from '@stefanoruth/react-gallery'
import classNames from 'classnames'

const images = ['/assets/image1.jpg', '/assets/image2.jpg', '/assets/image3.jpg']

export const App: React.FunctionComponent = () => {
    return (
        <div className="flex justify-center items-center bg-gray-300 min-h-screen">
            <div>
                <Gallery style={{ width: '600px', height: '450px' }}>
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
            </div>
        </div>
    )
}
