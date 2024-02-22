import Image from 'next/image';
import List from '@/app/List/page';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <List />
    </main>
  )
}
