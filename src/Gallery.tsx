import * as React from 'react'

interface GalleryController {
    ref: React.RefObject<HTMLDivElement>
    prev: () => void
    next: () => void
    step: React.MutableRefObject<number>
    setSlideCount: (value: number) => void
}

export const Gallery: React.FunctionComponent<{
    controller: GalleryController
    className?: string
    style?: React.CSSProperties
}> = ({ controller, ...props }) => {
    React.useEffect(() => {
        controller.setSlideCount(React.Children.count(props.children))
    }, [React.Children.count(props.children)])

    console.log()

    React.useEffect(() => {
        console.log(controller.step.current)
    }, [controller.step.current])

    return (
        <div className={props.className} style={{ ...{ position: 'relative' }, ...props.style }}>
            <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
                <div style={{ transform: `translateX(${controller.step.current * 100}%)`, position: 'relative' }}>
                    {React.Children.map(props.children, (child, i) => {
                        return React.cloneElement(child as any, {
                            style: { position: 'absolute', left: i * 100 + '%', width: '100%' },
                        })
                    })}
                </div>
            </div>
        </div>
    )
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
