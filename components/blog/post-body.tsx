type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  return (
    <div className="mx-auto dark:text-white text-black">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
