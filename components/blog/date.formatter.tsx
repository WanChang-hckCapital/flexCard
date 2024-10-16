import { parseISO, format } from "date-fns";

type Props = {
  dateString: string;
  dict: any;
};

const DateFormatter = ({ dateString, dict }: Props) => {
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString}>
      {dict.blog.blogcontent.createdat} {format(date, "LLLL	d, yyyy")}
    </time>
  );
};

export default DateFormatter;
