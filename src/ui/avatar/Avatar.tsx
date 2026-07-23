type AvatarProps = {
  name?: string;
  imageUrl?: string | null;
};

export default function Avatar({ name = "User", imageUrl }: AvatarProps) {
  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-sm font-black text-white">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}