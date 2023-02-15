import Link from 'next/link';
import styles from './page.module.scss';

export default function Home() {
    return (
        <main>
            <p>Tout le nécessaire pour le cadrage de projets de dématérialisation de vos téléservices</p>
            <section>
                <h2>Les utilitaires</h2>
                <div className={ styles.tilesList }>
                    <Link className={ styles.tilesList_Item } href="/service-export-analyzer">Analyseur d'export de téléservice</Link>
                </div>
            </section>
            <section>
                <h2>Les références</h2>
                <div className={ styles.tilesList }>
                    <a className={ styles.tilesList_Item } target="_blank" rel="noopener noreferrer" href="https://communaute-capdemat.fr/">Site officiel de CapDémat évolution</a>
                </div>
            </section>
        </main>
    )
}
