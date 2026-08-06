'use client';

import { useState } from 'react';
import { QuranPages } from '../../data/quran_page_data';

/**
 * 1. LOGIQUE DE CALCUL DU JOUZ'
 * Le Coran de Médine est standardisé : chaque Jouz' fait exactement 20 pages.
 * Les pages 1 et 2 font exception (Jouz2 1). Le rythme strict commence à la page 3.
 */
function getJouzByPage(page: number): number {
  if (page <= 2) return 1;// Les pages 1 et 2 appartiennent d'office au Jouz2 1
  // Math.floor permet d'arrondir à l'entier inférieur pour grouper par blocs de 20 pages.
  // On ajoute +1 à la fin car les Jouz' commencent à 1 et non à 0.
  return Math.floor((page - 3) / 20) + 1; 
}

/**
 * 2. LOGIQUE DE CALCUL DU THOUMOUN GLOBAL
 * Un Jouz' contient 2 Hizb, et 1 Hizb contient 4 Thoumoun $\rightarrow$ Il y a 8 Thoumoun par Jouz'.
 * Comme un Jouz' fait 20 pages, chaque Thoumoun fait mathématiquement : 20 / 8 = 2.5 pages.
 */
function getGlobalThoumounByPage(page: number): number {
  if (page <= 2) return 1;
  // On arrondit à l'inférieur (Math.floor) et on ajoute +1 pour avoir un index de 1 à 240.
  return Math.floor((page - 3) / 2.5) + 1;
}

export default function PageConceptSuivi() {
    // --- ÉTATS (STATES) DE L'INTERFACE ---
  // currentPage : Stocke le numéro de la page physique actuelle de l'étudiant (Exemple de départ : 21)
  const [currentPage, setCurrentPage] = useState<number>(21);
  // notification : Message dynamique destiné à l'enseignant (affiché seulement si un palier change)
  const [notification, setNotification] = useState<string | null>(null);
/**
   * 3. GESTION DE LA VALIDATION DE L'ÉTUDIANT
   * Déclenchée au clic sur un bouton. Reçoit la sourate et le verset validés.
   */
  const handleStudentValidation = (surah: number, verse: number) => {
    // ÉTAPE A : Traduction des coordonnées (Sourate, Verset) en numéro de page via la classe de la team
    const nouvellePage = QuranPages.getPageNumber(surah, verse);

    // Sécurité : Si les coordonnées n'existent pas dans le tableau, on arrête tout
    if (!nouvellePage) {
      setNotification("⚠️ Coordonnées coraniques invalides.");
      return;
    }
    // ÉTAPE B : Calcul de la situation AVANT la validation (Situation actuelle)
    const ancienJouz = getJouzByPage(currentPage);
    const ancienThoumounGlobal = getGlobalThoumounByPage(currentPage);
    // ÉTAPE C : Calcul de la situation APRÈS la validation (Nouvelle situation)
    const nouveauJouz = getJouzByPage(nouvellePage);
    const nouveauThoumounGlobal = getGlobalThoumounByPage(nouvellePage);

    // ÉTAPE D : Comparaison "Avant / Après" pour générer l'alerte Enseignant
    if (nouveauJouz > ancienJouz) {
        // Cas 1 : Le numéro de Jouz' a augmenté $\rightarrow$ Grand palier franchi !
      setNotification(`🏆 Changement de Jouz' ! L'étudiant vient de terminer le Jouz' ${ancienJouz} et commence le Jouz' ${nouveauJouz}.`);
    } else if (nouveauThoumounGlobal > ancienThoumounGlobal) {
        // Cas 2 : Même Jouz', mais le Thoumoun global a augmenté $\rightarrow$ Palier intermédiaire franchi.
      // On calcule le numéro du Thoumoun local (de 1 à 8) grâce à l'opérateur Modulo (%)
      const localThoumoun = ((ancienThoumounGlobal - 1) % 8) + 1;
      // On calcule le Hizb actuel (4 Thoumoun = 1 Hizb)
      const hizbActuel = Math.floor((ancienThoumounGlobal - 1) / 4) + 1;
      setNotification(` Nouveau Thoumoun ! L'étudiant a validé le Thoumoun n°${localThoumoun} (Hizb ${hizbActuel}, Jouz' ${ancienJouz}).`);
    } else {
        // Cas 3 : L'étudiant avance mais reste dans le même quart (pas de changement visuel pour le prof)
      setNotification(" Progression enregistrée dans le même bloc.");
    }

    // ÉTAPE E : Mise à jour de l'état avec la nouvelle page calculée
    setCurrentPage(nouvellePage);
  };

  // --- PRÉPARATION DES DONNÉES POUR L'AFFICHAGE (RENDER) ---
  const currentJouz = getJouzByPage(currentPage);
  const currentThoumounGlobal = getGlobalThoumounByPage(currentPage);
  // Modulo 8 : Convertit l'index global (ex: 9) en repère local récurrent pour l'écran (ex: Thoumoun 1/8)
  const currentThoumounLocal = ((currentThoumounGlobal - 1) % 8) + 1;

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Correction ici : Utilisation de " " pour entourer le titre contenant l'apostrophe */}
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        {"Détermination du Jouz' et Thoumoun"}
      </h1>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Calcul automatique basé sur le partitionnement de la page.
      </p>
      {/* AFFICHAGE DES REPERES ACTUELS DE L'ETUDIANT */}
      <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
        <p style={{ margin: '4px 0' }}><strong>Page courante :</strong> {currentPage}</p>
        {/* Correction ici : Utilisation de " " pour la chaîne avec apostrophe */}
        <p style={{ margin: '4px 0' }}>
          <strong>Repère traditionnel :</strong> {"Jouz'"} {currentJouz} — Thoumoun {currentThoumounLocal}/8
        </p>
      </div>
      {/* BLOC ALERTE DYNAMIQUE POUR L'ENSEIGNANT */}

      {notification && (
        <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #0284c7', marginBottom: '20px' }}>
          <strong>Alerte Enseignant :</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{notification}</p>
        </div>
      )}

      {/* CONFIGURATION DES BOUTONS DE TEST DE LA DEMO */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', margin: '0' }}>Simuler une action étudiant :</h2>
       {/* Test 1 : Reste sur la page 21 (v.141) $\rightarrow$ même Thoumoun */}
        <button 
          onClick={() => handleStudentValidation(2, 141)} 
          style={{ padding: '10px', background: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', textAlign: 'left' }}
        >
          Valider Sourate 2, Verset 141 (Reste page 21)
        </button>
        {/* Test 2 : Saute à la page 22 (v.142) $\rightarrow$ Rupture de Jouz' détectée par le useEffect/Handler */}
        <button 
          onClick={() => handleStudentValidation(2, 142)} 
          style={{ padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left' }}
        >
          {"Valider Sourate 2, Verset 142 (Bascule page 22 🏁 Jouz' 2)"}
        </button>
      </div>
    </div>
  );
}