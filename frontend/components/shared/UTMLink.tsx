'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export function UTMLink({ href, children, ...props }: React.ComponentProps<typeof Link>) {
  const searchParams = useSearchParams();

  const utmEntries = UTM_PARAMS
    .map(key => [key, searchParams.get(key)])
    .filter((entry): entry is [string, string] => entry[1] !== null);

  let finalHref = href.toString();
  if (utmEntries.length > 0) {
    const separator = finalHref.includes('?') ? '&' : '?';
    const utmString = new URLSearchParams(utmEntries).toString();
    finalHref = `${finalHref}${separator}${utmString}`;
  }

  return <Link href={finalHref} {...props}>{children}</Link>;
}
