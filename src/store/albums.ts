import { useEffect, useState } from 'react';
import { getDb } from '@/db/client';

export type Album = {
  id: string;
  shipId: string;
  title: string;
  coverUri: string;
  photoCount: number;
  createdAt: number;
};

export type AlbumPhoto = {
  id: string;
  albumId: string;
  uri: string;
  caption: string;
  createdAt: number;
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

export function getAlbums(shipId: string): Album[] {
  return (getDb().getAllSync(
    `SELECT a.*,
      (SELECT COUNT(*) FROM album_photos p WHERE p.album_id = a.id) as photo_count,
      (SELECT uri FROM album_photos p WHERE p.album_id = a.id ORDER BY p.created_at DESC LIMIT 1) as cover_uri
     FROM albums a WHERE a.ship_id = ? ORDER BY a.created_at DESC`,
    shipId,
  ) as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    shipId: r.ship_id as string,
    title: r.title as string,
    coverUri: (r.cover_uri as string) ?? '',
    photoCount: (r.photo_count as number) ?? 0,
    createdAt: r.created_at as number,
  }));
}

export function addAlbum(shipId: string, title: string): string {
  const id = String(Date.now());
  getDb().runSync(
    'INSERT INTO albums (id, ship_id, title, created_at) VALUES (?, ?, ?, ?)',
    id, shipId, title, Date.now(),
  );
  notify();
  return id;
}

export function deleteAlbum(id: string) {
  getDb().runSync('DELETE FROM album_photos WHERE album_id = ?', id);
  getDb().runSync('DELETE FROM albums WHERE id = ?', id);
  notify();
}

export function getAlbumPhotos(albumId: string): AlbumPhoto[] {
  return (getDb().getAllSync(
    'SELECT * FROM album_photos WHERE album_id = ? ORDER BY created_at DESC',
    albumId,
  ) as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    albumId: r.album_id as string,
    uri: r.uri as string,
    caption: (r.caption as string) ?? '',
    createdAt: r.created_at as number,
  }));
}

export function addAlbumPhoto(albumId: string, uri: string, caption = ''): string {
  const id = String(Date.now());
  getDb().runSync(
    'INSERT INTO album_photos (id, album_id, uri, caption, created_at) VALUES (?, ?, ?, ?, ?)',
    id, albumId, uri, caption, Date.now(),
  );
  notify();
  return id;
}

export function deleteAlbumPhoto(id: string) {
  getDb().runSync('DELETE FROM album_photos WHERE id = ?', id);
  notify();
}

export function useAlbums(shipId: string): Album[] {
  const [albums, setAlbums] = useState<Album[]>(() => getAlbums(shipId));
  useEffect(() => {
    const fn = () => setAlbums(getAlbums(shipId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [shipId]);
  return albums;
}

export function useAlbumPhotos(albumId: string): AlbumPhoto[] {
  const [photos, setPhotos] = useState<AlbumPhoto[]>(() => getAlbumPhotos(albumId));
  useEffect(() => {
    const fn = () => setPhotos(getAlbumPhotos(albumId));
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [albumId]);
  return photos;
}
