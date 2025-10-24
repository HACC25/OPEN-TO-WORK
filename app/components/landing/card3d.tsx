'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

interface CardTransform {
    rotateX: number
    rotateY: number
    scale: number
}

interface Image3DProps {
    src: string
    alt: string
    className?: string
    width?: number
    height?: number
}

export const Image3D = ({ src, alt, className = '', width = 500, height = 500 }: Image3DProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLDivElement>(null)
    const animationFrameRef = useRef<number | undefined>(undefined)
    const lastMousePosition = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const container = containerRef.current
        const image = imageRef.current

        if (!container || !image) return

        let rect: DOMRect
        let centerX: number
        let centerY: number

        const updateImageTransform = (mouseX: number, mouseY: number) => {
            if (!rect) {
                rect = container.getBoundingClientRect()
                centerX = rect.left + rect.width / 2
                centerY = rect.top + rect.height / 2
            }

            const relativeX = mouseX - centerX
            const relativeY = mouseY - centerY

            const imageTransform: CardTransform = {
                rotateX: relativeY * 0.02,
                rotateY: -relativeX * 0.01,
                scale: 1.02
            }

            return imageTransform
        }

        const animate = () => {
            const imageTransform = updateImageTransform(
                lastMousePosition.current.x,
                lastMousePosition.current.y
            )

            image.style.transform = `perspective(1000px) rotateX(${imageTransform.rotateX}deg) rotateY(${imageTransform.rotateY}deg) scale3d(${imageTransform.scale}, ${imageTransform.scale}, ${imageTransform.scale})`

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        const handleMouseMove = (e: MouseEvent) => {
            lastMousePosition.current = { x: e.clientX, y: e.clientY }
        }

        const handleMouseEnter = () => {
            image.style.transition = 'transform 0.2s ease'
            animate()
        }

        const handleMouseLeave = () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }

            image.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
            image.style.transition = 'transform 0.5s ease'
        }

        container.addEventListener('mouseenter', handleMouseEnter)
        container.addEventListener('mousemove', handleMouseMove)
        container.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }

            container.removeEventListener('mouseenter', handleMouseEnter)
            container.removeEventListener('mousemove', handleMouseMove)
            container.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])

    return (
        <div ref={containerRef} className={`inline-block ${className}`}>
            <div ref={imageRef} className='relative w-full h-auto rounded-md overflow-hidden'>
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className='w-full h-auto object-cover'
                />
            </div>
        </div>
    )
}
