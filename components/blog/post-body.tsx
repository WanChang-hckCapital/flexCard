// import markdownStyles from "./markdown-styles.module.css";

type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  return (
    <div className="mx-auto">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
