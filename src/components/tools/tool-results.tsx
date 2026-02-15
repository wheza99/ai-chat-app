'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Instagram, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ToolResultProps {
  type: 'image' | 'instagram' | 'replicate';
  data: any;
  loading?: boolean;
}

export function ToolResult({ type, data, loading }: ToolResultProps) {
  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Processing {type}...</span>
        </CardContent>
      </Card>
    );
  }

  if (type === 'image' && data?.image_url) {
    return (
      <Card className="w-full max-w-md overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-square">
            <Image
              src={data.image_url}
              alt="Generated image"
              fill
              className="object-cover"
            />
          </div>
          {data.prompt && (
            <p className="p-2 text-sm text-muted-foreground">{data.prompt}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (type === 'instagram' && data?.posts) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Instagram className="h-5 w-5 text-pink-500" />
            <span className="font-medium">{data.posts.length} posts found</span>
          </div>
          <div className="space-y-2">
            {data.posts.slice(0, 5).map((post: any, i: number) => (
              <div key={i} className="flex gap-2 p-2 bg-muted rounded-md">
                {post.display_url && (
                  <img
                    src={post.display_url}
                    alt="Post"
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{post.caption || 'No caption'}</p>
                  <p className="text-xs text-muted-foreground">
                    ❤️ {post.likes_count} • 💬 {post.comments_count}
                  </p>
                  <p className="text-xs text-muted-foreground">@{post.owner_username}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'replicate' && data?.generated_image_url) {
    return (
      <Card className="w-full max-w-md overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-1">
            {data.original_post?.display_url && (
              <div className="relative aspect-square">
                <img
                  src={data.original_post.display_url}
                  alt="Original"
                  className="object-cover w-full h-full"
                />
                <span className="absolute bottom-1 left-1 text-xs bg-black/50 px-1 rounded">
                  Original
                </span>
              </div>
            )}
            <div className="relative aspect-square">
              <img
                src={data.generated_image_url}
                alt="Generated"
                className="object-cover w-full h-full"
              />
              <span className="absolute bottom-1 left-1 text-xs bg-black/50 px-1 rounded">
                AI Generated
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
