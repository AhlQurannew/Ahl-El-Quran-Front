'use client';

import React, { useEffect, useState } from 'react';
import studentsAPI from '@/app/API/students';

interface StudentPhotoProps {
  studentId?: number | string;
  photo?: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}

export const StudentPhoto: React.FC<StudentPhotoProps> = ({
  studentId,
  photo,
  alt,
  className,
  fallback,
}) => {
  const [loadedPhoto, setLoadedPhoto] = useState<{ key: string; src: string } | null>(null);
  const inlinePhoto = photo?.startsWith('data:') ? photo : undefined;
  const photoKey = `${studentId ?? ''}:${photo ?? ''}`;
  const src = inlinePhoto || (loadedPhoto?.key === photoKey ? loadedPhoto.src : undefined);

  useEffect(() => {
    if (!photo || inlinePhoto || studentId === undefined) return;

    let isActive = true;
    let objectUrl: string | undefined;

    studentsAPI.getStudentPhoto(Number(studentId))
      .then((image) => {
        objectUrl = URL.createObjectURL(image);
        if (isActive) {
          setLoadedPhoto({ key: photoKey, src: objectUrl });
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      })
      .catch((error) => {
        console.error('Unable to load student profile photo:', error);
      });

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [studentId, photo, inlinePhoto, photoKey]);

  return src ? <img src={src} alt={alt} className={className} /> : <>{fallback}</>;
};
