import React from 'react'

interface GalleryController {
    ref: React.RefObject<HTMLDivElement>
    prev: () => void
    next: () => void
    step: React.MutableRefObject<number>
    setSlideCount: (value: number) => void
}

export const useGallery = (): GalleryController => {
    const ref = React.useRef<HTMLDivElement>(null)
    const [slideCount, setSlideCount] = React.useState(0)
    const slideStep = React.useRef(0)

    return {
        ref,
        step: slideStep,
        setSlideCount: value => {
            setSlideCount(value)
        },
        prev: () => {
            slideStep.current--
            console.log('prev')
        },
        next: () => {
            slideStep.current++
            console.log('next')
        },
    }
}
