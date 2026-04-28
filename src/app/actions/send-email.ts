"use server";

import nodemailer from "nodemailer";
import { supabaseServer } from "@/lib/supabase-server";
import path from "path";

const SPA_LOGO_CID = "logo-spa@zfitspa";
const FITNESS_LOGO_CID = "logo-fitness@zfitspa";

function getSpaLogoAttachment() {
  return {
    filename: "logo-spa-email.webp",
    path: path.join(process.cwd(), "public", "logo-spa-email.webp"),
    cid: SPA_LOGO_CID,
  };
}

function getFitnessLogoAttachment() {
  return {
    filename: "logo-fitness-email.png",
    path: path.join(process.cwd(), "public", "logo-fitness-email.png"),
    cid: FITNESS_LOGO_CID,
  };
}

const soinLabels: Record<string, string> = {
  "visage-hydratant": "Soin Minéral Hydratant — Peaux Sèches",
  "visage-purifiant": "Soin d'Équilibre Purifiant — Peaux Mixtes",
  "visage-apaisant": "Soin Apaisant — Peaux Sensibles",
  "visage-regenerant": "Soin Régénérant — Peaux Matures",
  "visage-eclat": "Soin Bio Éclat Ambre Bleue — Toutes Peaux",
  "visage-diamant": "Soin Éclat Diamant Masque Gel",
  "visage-amethyste": "Soin d'Équilibre Améthyste — Peaux Mixtes",
  "visage-smithsonite": "Soin Apaisant Smithsonite — Peaux Sensibles",
  "visage-perle-diamant": "Soin Lumière Perle & Diamant Éclaircissant",
  "visage-anti-rides": "Soin Anti-Rides Écrin Diamant",
  "visage-perle-blanche": "Soin Écrin Perle Blanche Anti-Tâches",
  "visage-collagene": "Soin Diamant & Collagène — Masque Prestige",
  "hammam-origine": "Hammam Origine",
  "hammam-bien-etre": "Hammam Bien-Être",
  "hammam-royal": "Hammam Royal",
  "gommage-sels-huiles": "Gommage aux Sels et Huiles Précieuses",
  "gommage-ayurvedique": "Gommage Ayurvédique aux Noyaux d'Abricot",
  "gommage-lulur": "Gommage Lulur — Rituel de Bali",
  "gommage-peridot": "Gommage aux Sels de Péridot — Relaxant",
  "gommage-rubis": "Gommage aux Sels de Rubis — Anti-Âge",
  "gommage-saphir": "Gommage aux Sels de Saphir — Amincissant",
  "gommage-perle": "Gommage à la Perle — Adoucissant",
  "gommage-mangue": "Gommage à l'Éclat de Mangue — Énergisant",
  "massage-balinais-50": "Massage Balinais (50min)",
  "massage-balinais-80": "Massage Balinais (80min)",
  "massage-ayurvedique-50": "Massage Ayurvédique (50min)",
  "massage-ayurvedique-80": "Massage Ayurvédique (80min)",
  "massage-oriental-50": "Massage Oriental (50min)",
  "massage-oriental-80": "Massage Oriental (80min)",
  "foot-massage": "Foot Massage Réflexologique",
  "radiance-visage": "Radiance Visage",
  "massage-dos": "Massage du Dos",
  "massage-jambes": "Destress Massage des Jambes",
  "massage-cristal": "Massage Visage Énergétique — Cristal & Jade",
  "massage-quartz-jade": "Massage Corps — Quartz Rose & Jade",
  "signature-orientale": "Signature Détente à l'Orientale",
  "epil-bras": "Épilation Bras",
  "epil-demi-jambes": "Épilation Demi Jambes / Cuisse",
  "epil-jambes": "Épilation Jambes Entières",
  "epil-maillot-integral": "Épilation Maillot Intégral",
  "epil-maillot-bresilien": "Épilation Maillot Brésilien",
  "epil-aisselles": "Épilation Aisselles",
  "epil-visage-complet": "Épilation Visage Complet",
  "epil-sourcils": "Épilation Sourcils",
  "epil-levres-menton": "Épilation Lèvres / Duvet / Menton",
  "epil-dos-ventre": "Épilation Dos / Ventre",
  "epil-forfait": "Forfait Jambes + Maillot Brésilien + Aisselles",
  "forfait-escale-balinaise": "Journée Escale Balinaise (2H)",
  "forfait-voyage-ayurvedique": "Journée Voyage Ayurvédique (2H30)",
  "forfait-orientale": "Journée Détente à l'Orientale (3H)",
  "rituel-rotorua": "Rituel Minéral du Volcan Rotorua (1H15)",
  "rituel-the-cacao": "Rituel Détoxifiant Thé & Cacao (1H15)",
  "rituel-rose-grenat": "Rituel Minéral Anti-Âge Rose Grenat (1H15)",
  "rituel-menthe-prele": "Rituel Tonifiant Menthe & Prêle (1H15)",
};

const resolveSoins = (soins: string[] | string | undefined): string | null => {
  if (!soins || (Array.isArray(soins) && soins.length === 0)) return null;
  const ids = Array.isArray(soins) ? soins : [soins];
  return ids.map((id) => soinLabels[id] || id).join(", ");
};

type FormData = {
  civilite?: string;
  nom: string;
  prenom: string;
  phone: string;
  email: string;
  type: string;
  note?: string;
  soins?: string[];
  jour?: string;
  heure?: string;
};

/* ─────────────────────────────────────────────
   DARK THEME  (Fitness)
───────────────────────────────────────────── */
function buildFitnessNotificationHtml(f: FormData) {
  const soinLabel = resolveSoins(f.soins);
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#000000;border:1px solid #1a1a1a;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-fitness@zfitspa" alt="Z FIT / SPA" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#E13027;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#E13027;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Nouvelle demande</p>
        <h1 style="margin:0 0 32px;color:#ffffff;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.2;">Réservation<br><em style="color:#E13027;">reçue</em></h1>
        <p style="margin:0 0 32px;color:rgba(255,255,255,0.45);font-family:Georgia,serif;font-size:13px;line-height:1.8;">Une nouvelle demande de réservation a été soumise via le site web ZFitSpa.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1f1f1f;">
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;width:45%;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Nom complet</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:15px;">${f.civilite ? f.civilite + ' ' : ''}${f.nom} ${f.prenom}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Téléphone / WhatsApp</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:15px;">${f.phone}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Email</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:15px;">${f.email}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Service demandé</p></td>
            <td style="padding:18px 0;"><p style="margin:0;color:#E13027;font-family:Georgia,serif;font-size:15px;letter-spacing:2px;text-transform:uppercase;">${f.type}</p></td>
          </tr>
          ${soinLabel ? `<tr><td style="padding:18px 0;border-top:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin</p></td><td style="padding:18px 0;border-top:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:15px;">${soinLabel}</p></td></tr>` : ""}
          ${f.jour ? `<tr><td style="padding:18px 0;border-top:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Jour</p></td><td style="padding:18px 0;border-top:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:15px;">${f.jour}</p></td></tr>` : ""}
          ${f.heure ? `<tr><td style="padding:18px 0;border-top:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Heure</p></td><td style="padding:18px 0;border-top:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:15px;">${f.heure}</p></td></tr>` : ""}
          ${f.note ? `<tr><td style="padding:18px 0;border-top:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Note</p></td><td style="padding:18px 0;border-top:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.75);font-family:Georgia,serif;font-size:14px;line-height:1.6;">${f.note}</p></td></tr>` : ""}
        </table>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #1a1a1a;text-align:center;">
        <p style="margin:0;color:rgba(255,255,255,0.18);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Envoi automatique depuis le système de réservation</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildFitnessConfirmationHtml(f: FormData) {
  const soinLabel = resolveSoins(f.soins);
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#000000;border:1px solid #1a1a1a;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-fitness@zfitspa" alt="Z FIT / SPA" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#E13027;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#E13027;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Confirmation</p>
        <h1 style="margin:0 0 24px;color:#ffffff;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.2;">Bonjour ${f.civilite ? f.civilite + ' ' + f.nom : f.prenom},<br><em style="color:#E13027;">votre demande est bien reçue.</em></h1>
        <p style="margin:0 0 32px;color:rgba(255,255,255,0.55);font-family:Georgia,serif;font-size:13px;line-height:1.9;">Nous avons bien reçu votre demande de réservation et notre équipe reviendra vers vous dans les meilleurs délais pour confirmer votre rendez-vous.</p>
        <p style="margin:0 0 16px;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Récapitulatif</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1f1f1f;">
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid #1f1f1f;width:45%;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Nom complet</p></td>
            <td style="padding:16px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:14px;">${f.civilite ? f.civilite + ' ' : ''}${f.nom} ${f.prenom}</p></td>
          </tr>
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Service</p></td>
            <td style="padding:16px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#E13027;font-family:Georgia,serif;font-size:14px;letter-spacing:2px;text-transform:uppercase;">${f.type}</p></td>
          </tr>
          ${soinLabel ? `<tr><td style="padding:16px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin</p></td><td style="padding:16px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:14px;">${soinLabel}</p></td></tr>` : ""}
          ${f.jour ? `<tr><td style="padding:16px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Jour</p></td><td style="padding:16px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:14px;">${f.jour}</p></td></tr>` : ""}
          ${f.heure ? `<tr><td style="padding:16px 0;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Heure</p></td><td style="padding:16px 0;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:14px;">${f.heure}</p></td></tr>` : ""}
        </table>
        <p style="margin:32px 0 0;color:rgba(255,255,255,0.35);font-family:Georgia,serif;font-size:12px;line-height:1.8;">Pour toute question, contactez-nous ou répondez directement à cet email.</p>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #1a1a1a;text-align:center;">
        <p style="margin:0;color:rgba(255,255,255,0.18);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/* ─────────────────────────────────────────────
   LIGHT THEME  (Spa) — ivoire & or
───────────────────────────────────────────── */
function buildSpaNotificationHtml(f: FormData) {
  const soinLabel = resolveSoins(f.soins);
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#EDE8E0;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE8E0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FDFAF5;border:1px solid #DDD5C8;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-spa@zfitspa" alt="Le Spa by Z FIT" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#C4A87A;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#C4A87A;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Nouvelle demande</p>
        <h1 style="margin:0 0 32px;color:#1C1108;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.2;">Réservation<br><em style="color:#C4A87A;">reçue</em></h1>
        <p style="margin:0 0 32px;color:rgba(28,17,8,0.5);font-family:Georgia,serif;font-size:13px;line-height:1.8;">Une nouvelle demande de réservation a été soumise via le site web ZFitSpa — Espace Spa.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #DDD5C8;">
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;width:45%;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Nom complet</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${f.civilite ? f.civilite + ' ' : ''}${f.nom} ${f.prenom}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Téléphone / WhatsApp</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${f.phone}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Email</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${f.email}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Service demandé</p></td>
            <td style="padding:18px 0;"><p style="margin:0;color:#C4A87A;font-family:Georgia,serif;font-size:15px;letter-spacing:2px;text-transform:uppercase;">${f.type}</p></td>
          </tr>
          ${soinLabel ? `<tr><td style="padding:18px 0;border-top:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin</p></td><td style="padding:18px 0;border-top:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${soinLabel}</p></td></tr>` : ""}
          ${f.jour ? `<tr><td style="padding:18px 0;border-top:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Jour</p></td><td style="padding:18px 0;border-top:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${f.jour}</p></td></tr>` : ""}
          ${f.heure ? `<tr><td style="padding:18px 0;border-top:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Heure</p></td><td style="padding:18px 0;border-top:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${f.heure}</p></td></tr>` : ""}
          ${f.note ? `<tr><td style="padding:18px 0;border-top:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Note</p></td><td style="padding:18px 0;border-top:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.65);font-family:Georgia,serif;font-size:14px;line-height:1.6;">${f.note}</p></td></tr>` : ""}
        </table>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #DDD5C8;text-align:center;background-color:#F5EFE6;">
        <p style="margin:0;color:rgba(28,17,8,0.3);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Envoi automatique depuis le système de réservation</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildSpaConfirmationHtml(f: FormData) {
  const soinLabel = resolveSoins(f.soins);
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#EDE8E0;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE8E0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FDFAF5;border:1px solid #DDD5C8;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-spa@zfitspa" alt="Le Spa by Z FIT" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#C4A87A;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#C4A87A;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Confirmation</p>
        <h1 style="margin:0 0 24px;color:#1C1108;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.3;">Bonjour ${f.civilite ? f.civilite + ' ' + f.nom : f.prenom},<br><em style="color:#C4A87A;">votre demande est bien reçue.</em></h1>
        <p style="margin:0 0 36px;color:rgba(28,17,8,0.55);font-family:Georgia,serif;font-size:13px;line-height:1.9;">Nous avons bien reçu votre demande de réservation et notre équipe reviendra vers vous dans les meilleurs délais pour confirmer votre rendez-vous au spa.</p>
        <p style="margin:0 0 16px;color:rgba(28,17,8,0.3);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Récapitulatif</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #DDD5C8;">
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid #DDD5C8;width:45%;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Nom complet</p></td>
            <td style="padding:16px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:14px;">${f.civilite ? f.civilite + ' ' : ''}${f.nom} ${f.prenom}</p></td>
          </tr>
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Service</p></td>
            <td style="padding:16px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#C4A87A;font-family:Georgia,serif;font-size:14px;letter-spacing:2px;text-transform:uppercase;">${f.type}</p></td>
          </tr>
          ${soinLabel ? `<tr><td style="padding:16px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin</p></td><td style="padding:16px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:14px;">${soinLabel}</p></td></tr>` : ""}
          ${f.jour ? `<tr><td style="padding:16px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Jour</p></td><td style="padding:16px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:14px;">${f.jour}</p></td></tr>` : ""}
          ${f.heure ? `<tr><td style="padding:16px 0;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Heure</p></td><td style="padding:16px 0;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:14px;">${f.heure}</p></td></tr>` : ""}
        </table>
        <p style="margin:32px 0 0;color:rgba(28,17,8,0.4);font-family:Georgia,serif;font-size:12px;line-height:1.8;">Pour toute question, contactez-nous ou répondez directement à cet email.</p>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #DDD5C8;text-align:center;background-color:#F5EFE6;">
        <p style="margin:0;color:rgba(28,17,8,0.3);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export async function sendReservationEmail(formData: FormData) {
  const isSpa = formData.type === "spa";

  await supabaseServer.from("reservations").insert({
    nom: formData.nom,
    prenom: formData.prenom,
    email: formData.email,
    telephone: formData.phone,
    type: formData.type,
    soin: resolveSoins(formData.soins),
    date_reservation: formData.jour || null,
    heure: formData.heure || null,
    message: formData.note || null,
    status: "pending",
    created_at: new Date().toISOString(),
  });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: false,
    },
  });

  const notificationHtml = isSpa
    ? buildSpaNotificationHtml(formData)
    : buildFitnessNotificationHtml(formData);

  const confirmationHtml = isSpa
    ? buildSpaConfirmationHtml(formData)
    : buildFitnessConfirmationHtml(formData);

  const spaAttachments = isSpa ? [getSpaLogoAttachment()] : [getFitnessLogoAttachment()];

  const internalMail = {
    from: `"ZFitSpa" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    subject: `Nouvelle réservation — ${formData.type.toUpperCase()} | ${formData.civilite || ''} ${formData.nom} ${formData.prenom}`.trim(),
    html: notificationHtml,
    attachments: spaAttachments,
  };

  const clientMail = {
    from: `"Z FIT / SPA" <${process.env.EMAIL_USER}>`,
    to: formData.email,
    subject: `Confirmation de réservation — Z FIT / SPA`,
    html: confirmationHtml,
    attachments: spaAttachments,
  };

  try {
    await transporter.sendMail(internalMail);
    if (formData.email) {
      await transporter.sendMail(clientMail);
    }
    return { success: true };
  } catch (error: any) {
    console.error("Erreur détaillée lors de l'envoi de l'email:", {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    return { success: false, error: error.message || "Impossible d'envoyer l'email" };
  }
}

/* ─────────────────────────────────────────────
   RESCHEDULE EMAILS
───────────────────────────────────────────── */
type RescheduleData = {
  nom: string;
  prenom: string;
  soin: string | null;
  type: string;
  newDate: string;
  newTime: string;
};

function fmtDate(d: string): string {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(y, m - 1, day).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function buildSpaRescheduleHtml(r: RescheduleData) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#EDE8E0;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE8E0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FDFAF5;border:1px solid #DDD5C8;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-spa@zfitspa" alt="Le Spa by Z FIT" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#C4A87A;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#C4A87A;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Modification de rendez-vous</p>
        <h1 style="margin:0 0 24px;color:#1C1108;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.3;">Bonjour ${r.prenom},<br><em style="color:#C4A87A;">votre créneau a été modifié.</em></h1>
        <p style="margin:0 0 36px;color:rgba(28,17,8,0.55);font-family:Georgia,serif;font-size:13px;line-height:1.9;">Suite à votre réservation, notre équipe a ajusté votre rendez-vous. Veuillez trouver ci-dessous votre nouveau créneau confirmé.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #DDD5C8;">
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;width:45%;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Client</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${r.nom} ${r.prenom}</p></td>
          </tr>
          ${r.soin ? `<tr><td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin</p></td><td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${r.soin}</p></td></tr>` : ""}
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Nouveau jour</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#C4A87A;font-family:Georgia,serif;font-size:15px;font-style:italic;">${fmtDate(r.newDate)}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Nouvelle heure</p></td>
            <td style="padding:18px 0;"><p style="margin:0;color:#C4A87A;font-family:Georgia,serif;font-size:15px;font-style:italic;">${r.newTime}</p></td>
          </tr>
        </table>
        <p style="margin:32px 0 0;color:rgba(28,17,8,0.4);font-family:Georgia,serif;font-size:12px;line-height:1.8;">Pour toute question, contactez-nous ou répondez directement à cet email.</p>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #DDD5C8;text-align:center;background-color:#F5EFE6;">
        <p style="margin:0;color:rgba(28,17,8,0.3);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildFitnessRescheduleHtml(r: RescheduleData) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#000000;border:1px solid #1a1a1a;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-fitness@zfitspa" alt="Z FIT / SPA" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#E13027;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#E13027;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Modification de rendez-vous</p>
        <h1 style="margin:0 0 24px;color:#ffffff;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.3;">Bonjour ${r.prenom},<br><em style="color:#E13027;">votre créneau a été modifié.</em></h1>
        <p style="margin:0 0 32px;color:rgba(255,255,255,0.45);font-family:Georgia,serif;font-size:13px;line-height:1.8;">Suite à votre réservation, notre équipe a ajusté votre rendez-vous. Veuillez trouver ci-dessous votre nouveau créneau confirmé.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1f1f1f;">
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;width:45%;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Client</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:15px;">${r.nom} ${r.prenom}</p></td>
          </tr>
          ${r.soin ? `<tr><td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin</p></td><td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:15px;">${r.soin}</p></td></tr>` : ""}
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Nouveau jour</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#E13027;font-family:Georgia,serif;font-size:15px;font-style:italic;">${fmtDate(r.newDate)}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Nouvelle heure</p></td>
            <td style="padding:18px 0;"><p style="margin:0;color:#E13027;font-family:Georgia,serif;font-size:15px;font-style:italic;">${r.newTime}</p></td>
          </tr>
        </table>
        <p style="margin:32px 0 0;color:rgba(255,255,255,0.35);font-family:Georgia,serif;font-size:12px;line-height:1.8;">Pour toute question, contactez-nous ou répondez directement à cet email.</p>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #1a1a1a;text-align:center;">
        <p style="margin:0;color:rgba(255,255,255,0.18);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function sendRescheduleEmail(payload: {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  soin: string | null;
  type: string;
  newDate: string;
  newTime: string;
}) {
  if (!payload.email) return { success: true };

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: false,
    },
  });

  const isSpa = payload.type === "spa";
  const html = isSpa
    ? buildSpaRescheduleHtml(payload)
    : buildFitnessRescheduleHtml(payload);

  try {
    await transporter.sendMail({
      from: `"Z FIT / SPA" <${process.env.EMAIL_USER}>`,
      to: payload.email,
      subject: `Modification de votre rendez-vous — Z FIT / SPA`,
      html,
      attachments: isSpa ? [getSpaLogoAttachment()] : [getFitnessLogoAttachment()],
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Impossible d'envoyer l'email" };
  }
}

/* ─────────────────────────────────────────────
   APPROVAL EMAILS
───────────────────────────────────────────── */
type ApprovalData = {
  nom: string;
  prenom: string;
  soin: string | null;
  dateLabel: string;
  heure: string;
};

function buildSpaApprovalHtml(r: ApprovalData) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#EDE8E0;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE8E0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FDFAF5;border:1px solid #DDD5C8;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-spa@zfitspa" alt="Le Spa by Z FIT" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#C4A87A;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#C4A87A;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Réservation confirmée</p>
        <h1 style="margin:0 0 24px;color:#1C1108;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.3;">Bonjour ${r.prenom},<br><em style="color:#C4A87A;">votre rendez-vous est confirmé.</em></h1>
        <p style="margin:0 0 36px;color:rgba(28,17,8,0.55);font-family:Georgia,serif;font-size:13px;line-height:1.9;">Nous avons le plaisir de vous confirmer votre rendez-vous au spa. Nous vous attendons à la date et à l'heure indiquées ci-dessous.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #DDD5C8;">
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;width:45%;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Client</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${r.nom} ${r.prenom}</p></td>
          </tr>
          ${r.soin ? `<tr><td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin</p></td><td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${r.soin}</p></td></tr>` : ""}
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Date</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#C4A87A;font-family:Georgia,serif;font-size:15px;font-style:italic;">${r.dateLabel}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Heure</p></td>
            <td style="padding:18px 0;"><p style="margin:0;color:#C4A87A;font-family:Georgia,serif;font-size:15px;font-style:italic;">${r.heure}</p></td>
          </tr>
        </table>
        <p style="margin:32px 0 0;color:rgba(28,17,8,0.4);font-family:Georgia,serif;font-size:12px;line-height:1.8;">Pour toute question ou annulation, contactez-nous ou répondez directement à cet email.</p>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #DDD5C8;text-align:center;background-color:#F5EFE6;">
        <p style="margin:0;color:rgba(28,17,8,0.3);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildFitnessApprovalHtml(r: ApprovalData) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#000000;border:1px solid #1a1a1a;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-fitness@zfitspa" alt="Z FIT / SPA" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#E13027;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#E13027;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Réservation confirmée</p>
        <h1 style="margin:0 0 24px;color:#ffffff;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.3;">Bonjour ${r.prenom},<br><em style="color:#E13027;">votre rendez-vous est confirmé.</em></h1>
        <p style="margin:0 0 32px;color:rgba(255,255,255,0.45);font-family:Georgia,serif;font-size:13px;line-height:1.8;">Nous avons le plaisir de vous confirmer votre rendez-vous. Nous vous attendons à la date et à l'heure indiquées ci-dessous.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #1f1f1f;">
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;width:45%;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Client</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:15px;">${r.nom} ${r.prenom}</p></td>
          </tr>
          ${r.soin ? `<tr><td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin</p></td><td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#ffffff;font-family:Georgia,serif;font-size:15px;">${r.soin}</p></td></tr>` : ""}
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Date</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #1f1f1f;"><p style="margin:0;color:#E13027;font-family:Georgia,serif;font-size:15px;font-style:italic;">${r.dateLabel}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;"><p style="margin:0;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Heure</p></td>
            <td style="padding:18px 0;"><p style="margin:0;color:#E13027;font-family:Georgia,serif;font-size:15px;font-style:italic;">${r.heure}</p></td>
          </tr>
        </table>
        <p style="margin:32px 0 0;color:rgba(255,255,255,0.35);font-family:Georgia,serif;font-size:12px;line-height:1.8;">Pour toute question ou annulation, contactez-nous ou répondez directement à cet email.</p>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #1a1a1a;text-align:center;">
        <p style="margin:0;color:rgba(255,255,255,0.18);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function sendApprovalEmail(payload: {
  nom: string;
  prenom: string;
  email: string;
  soin: string | null;
  type: string;
  date: string | null;
  heure: string | null;
}) {
  if (!payload.email) return { success: true };

  const dateLabel = payload.date ? fmtDate(payload.date.slice(0, 10)) : '—';

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: false,
    },
  });

  const isSpa = payload.type === "spa";
  const html = isSpa
    ? buildSpaApprovalHtml({ nom: payload.nom, prenom: payload.prenom, soin: payload.soin, dateLabel, heure: payload.heure || '—' })
    : buildFitnessApprovalHtml({ nom: payload.nom, prenom: payload.prenom, soin: payload.soin, dateLabel, heure: payload.heure || '—' });

  try {
    await transporter.sendMail({
      from: `"Z FIT / SPA" <${process.env.EMAIL_USER}>`,
      to: payload.email,
      subject: `Votre réservation est confirmée — Z FIT / SPA`,
      html,
      attachments: isSpa ? [getSpaLogoAttachment()] : [getFitnessLogoAttachment()],
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Impossible d'envoyer l'email" };
  }
}

/* ─────────────────────────────────────────────
   REFUSAL EMAILS
───────────────────────────────────────────── */
function buildSpaRefusalHtml(r: { nom: string; prenom: string; soin: string | null }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#EDE8E0;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE8E0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FDFAF5;border:1px solid #DDD5C8;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-spa@zfitspa" alt="Le Spa by Z FIT" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#C4A87A;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:rgba(28,17,8,0.4);font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Concernant votre demande</p>
        <h1 style="margin:0 0 24px;color:#1C1108;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.3;">Bonjour ${r.prenom},<br><em style="color:#C4A87A;">nous ne pouvons pas confirmer votre rendez-vous.</em></h1>
        <p style="margin:0 0 24px;color:rgba(28,17,8,0.55);font-family:Georgia,serif;font-size:13px;line-height:1.9;">Nous regrettons de vous informer que votre demande de réservation${r.soin ? ` pour <strong style="color:#1C1108;">${r.soin}</strong>` : ""} ne peut pas être confirmée pour le créneau souhaité.</p>
        <p style="margin:0 0 36px;color:rgba(28,17,8,0.55);font-family:Georgia,serif;font-size:13px;line-height:1.9;">Nous vous invitons à nous contacter directement afin de trouver ensemble un créneau qui vous convienne, ou à soumettre une nouvelle demande via notre site.</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:20px 24px;background-color:#F5EFE6;border:1px solid #DDD5C8;">
              <p style="margin:0 0 4px;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Nous contacter</p>
              <p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:13px;line-height:1.7;">Répondez à cet email ou contactez-nous directement — notre équipe se fera un plaisir de vous accompagner.</p>
            </td>
          </tr>
        </table>
        <p style="margin:32px 0 0;color:rgba(28,17,8,0.4);font-family:Georgia,serif;font-size:12px;line-height:1.8;">Nous vous remercions de votre confiance et espérons vous accueillir très prochainement.</p>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #DDD5C8;text-align:center;background-color:#F5EFE6;">
        <p style="margin:0;color:rgba(28,17,8,0.3);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildFitnessRefusalHtml(r: { nom: string; prenom: string; soin: string | null }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#000000;border:1px solid #1a1a1a;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-fitness@zfitspa" alt="Z FIT / SPA" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#E13027;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:rgba(255,255,255,0.3);font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Concernant votre demande</p>
        <h1 style="margin:0 0 24px;color:#ffffff;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.3;">Bonjour ${r.prenom},<br><em style="color:#E13027;">nous ne pouvons pas confirmer votre rendez-vous.</em></h1>
        <p style="margin:0 0 24px;color:rgba(255,255,255,0.45);font-family:Georgia,serif;font-size:13px;line-height:1.8;">Nous regrettons de vous informer que votre demande de réservation${r.soin ? ` pour <strong style="color:#ffffff;">${r.soin}</strong>` : ""} ne peut pas être confirmée pour le créneau souhaité.</p>
        <p style="margin:0 0 36px;color:rgba(255,255,255,0.45);font-family:Georgia,serif;font-size:13px;line-height:1.8;">Nous vous invitons à nous contacter directement afin de trouver ensemble un créneau qui vous convienne, ou à soumettre une nouvelle demande via notre site.</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:20px 24px;background-color:#111111;border:1px solid #1f1f1f;">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Nous contacter</p>
              <p style="margin:0;color:rgba(255,255,255,0.6);font-family:Georgia,serif;font-size:13px;line-height:1.7;">Répondez à cet email ou contactez-nous directement — notre équipe se fera un plaisir de vous accompagner.</p>
            </td>
          </tr>
        </table>
        <p style="margin:32px 0 0;color:rgba(255,255,255,0.35);font-family:Georgia,serif;font-size:12px;line-height:1.8;">Nous vous remercions de votre confiance et espérons vous accueillir très prochainement.</p>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #1a1a1a;text-align:center;">
        <p style="margin:0;color:rgba(255,255,255,0.18);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function sendRefusalEmail(payload: {
  nom: string;
  prenom: string;
  email: string;
  soin: string | null;
  type: string;
}) {
  if (!payload.email) return { success: true };

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: false,
    },
  });

  const isSpa = payload.type === "spa";
  const html = isSpa ? buildSpaRefusalHtml(payload) : buildFitnessRefusalHtml(payload);

  try {
    await transporter.sendMail({
      from: `"Z FIT / SPA" <${process.env.EMAIL_USER}>`,
      to: payload.email,
      subject: `Votre demande de réservation — Z FIT / SPA`,
      html,
      attachments: isSpa ? [getSpaLogoAttachment()] : [getFitnessLogoAttachment()],
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Impossible d'envoyer l'email" };
  }
}

/* ─────────────────────────────────────────────
   GIFT CARD EMAIL
───────────────────────────────────────────── */
export type GiftCardData = {
  offrantPrenom: string;
  offrantNom: string;
  offrantPhone: string;
  offrantEmail: string;
  beneficiairePrenom: string;
  beneficiaireNom: string;
  beneficiairePhone: string;
  beneficiaireEmail: string;
  soin: string;
  message?: string;
};

function buildGiftCardNotificationHtml(d: GiftCardData) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#EDE8E0;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE8E0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FDFAF5;border:1px solid #DDD5C8;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-spa@zfitspa" alt="Le Spa by Z FIT" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#C4A87A;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#C4A87A;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Nouvelle demande</p>
        <h1 style="margin:0 0 32px;color:#1C1108;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.2;">Carte cadeaux<br><em style="color:#C4A87A;">reçue</em></h1>
        <p style="margin:0 0 32px;color:rgba(28,17,8,0.5);font-family:Georgia,serif;font-size:13px;line-height:1.8;">Une nouvelle demande de carte cadeaux a été soumise via le site web.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #DDD5C8;">
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;width:45%;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Offrant</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${d.offrantPrenom} ${d.offrantNom}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Téléphone</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${d.offrantPhone}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Email</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${d.offrantEmail}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Bénéficiaire</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#C4A87A;font-family:Georgia,serif;font-size:15px;font-style:italic;">${d.beneficiairePrenom} ${d.beneficiaireNom}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Tél. bénéficiaire</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${d.beneficiairePhone}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Email bénéficiaire</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${d.beneficiaireEmail}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;${d.message ? 'border-bottom:1px solid #DDD5C8;' : ''}"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin offert</p></td>
            <td style="padding:18px 0;${d.message ? 'border-bottom:1px solid #DDD5C8;' : ''}"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${d.soin}</p></td>
          </tr>
          ${d.message ? `<tr><td style="padding:18px 0;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Message</p></td><td style="padding:18px 0;"><p style="margin:0;color:rgba(28,17,8,0.7);font-family:Georgia,serif;font-size:14px;line-height:1.7;font-style:italic;">"${d.message}"</p></td></tr>` : ''}
        </table>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #DDD5C8;text-align:center;background-color:#F5EFE6;">
        <p style="margin:0;color:rgba(28,17,8,0.3);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildGiftCardConfirmationHtml(d: GiftCardData) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#EDE8E0;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE8E0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FDFAF5;border:1px solid #DDD5C8;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-spa@zfitspa" alt="Le Spa by Z FIT" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#C4A87A;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#C4A87A;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Confirmation</p>
        <h1 style="margin:0 0 24px;color:#1C1108;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.2;">Bonjour ${d.offrantPrenom},<br><em style="color:#C4A87A;">votre demande est bien reçue.</em></h1>
        <p style="margin:0 0 32px;color:rgba(28,17,8,0.55);font-family:Georgia,serif;font-size:13px;line-height:1.9;">Nous avons bien reçu votre demande de carte cadeaux. Notre équipe vous contactera dans les meilleurs délais pour finaliser votre commande et vous remettre votre carte personnalisée.</p>
        <p style="margin:0 0 16px;color:rgba(28,17,8,0.25);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Récapitulatif</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #DDD5C8;">
          <tr>
            <td style="padding:16px 0;border-bottom:1px solid #DDD5C8;width:45%;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Bénéficiaire</p></td>
            <td style="padding:16px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#C4A87A;font-family:Georgia,serif;font-size:15px;font-style:italic;">${d.beneficiairePrenom} ${d.beneficiaireNom}</p></td>
          </tr>
          <tr>
            <td style="padding:16px 0;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin offert</p></td>
            <td style="padding:16px 0;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${d.soin}</p></td>
          </tr>
        </table>
        <p style="margin:32px 0 0;color:rgba(28,17,8,0.4);font-family:Georgia,serif;font-size:12px;line-height:1.8;">Pour toute question, contactez-nous ou répondez directement à cet email.</p>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #DDD5C8;text-align:center;background-color:#F5EFE6;">
        <p style="margin:0;color:rgba(28,17,8,0.3);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildGiftCardBeneficiaireHtml(d: GiftCardData) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#EDE8E0;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#EDE8E0;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FDFAF5;border:1px solid #DDD5C8;">
      <tr><td style="background-color:#ffffff;padding:28px 48px;text-align:center;">
        <img src="cid:logo-spa@zfitspa" alt="Le Spa by Z FIT" width="100" style="max-width:100px;height:auto;display:block;margin:0 auto;" />
      </td></tr>
      <tr><td style="height:1px;background-color:#C4A87A;line-height:1px;font-size:1px;">&nbsp;</td></tr>
      <tr><td style="padding:48px 48px 40px;">
        <p style="margin:0 0 6px;color:#C4A87A;font-family:Georgia,serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;">Une attention pour vous</p>
        <h1 style="margin:0 0 24px;color:#1C1108;font-family:Georgia,serif;font-size:28px;font-weight:400;line-height:1.3;">Bonjour ${d.beneficiairePrenom},<br><em style="color:#C4A87A;">vous avez reçu une carte cadeaux.</em></h1>
        <p style="margin:0 0 36px;color:rgba(28,17,8,0.55);font-family:Georgia,serif;font-size:13px;line-height:1.9;"><strong style="color:#1C1108;">${d.offrantPrenom} ${d.offrantNom}</strong> vous offre une carte cadeaux au Spa by Z FIT. Notre équipe vous contactera prochainement pour convenir de votre rendez-vous.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #DDD5C8;">
          <tr>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;width:45%;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Offert par</p></td>
            <td style="padding:18px 0;border-bottom:1px solid #DDD5C8;"><p style="margin:0;color:#1C1108;font-family:Georgia,serif;font-size:15px;">${d.offrantPrenom} ${d.offrantNom}</p></td>
          </tr>
          <tr>
            <td style="padding:18px 0;${d.message ? 'border-bottom:1px solid #DDD5C8;' : ''}"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Soin offert</p></td>
            <td style="padding:18px 0;${d.message ? 'border-bottom:1px solid #DDD5C8;' : ''}"><p style="margin:0;color:#C4A87A;font-family:Georgia,serif;font-size:15px;font-style:italic;">${d.soin}</p></td>
          </tr>
          ${d.message ? `<tr><td style="padding:18px 0;"><p style="margin:0;color:rgba(28,17,8,0.35);font-family:Georgia,serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;">Message</p></td><td style="padding:18px 0;"><p style="margin:0;color:rgba(28,17,8,0.7);font-family:Georgia,serif;font-size:14px;line-height:1.7;font-style:italic;">"${d.message}"</p></td></tr>` : ''}
        </table>
        <p style="margin:32px 0 0;color:rgba(28,17,8,0.4);font-family:Georgia,serif;font-size:12px;line-height:1.8;">Pour toute question, contactez-nous ou répondez directement à cet email.</p>
      </td></tr>
      <tr><td style="padding:24px 48px;border-top:1px solid #DDD5C8;text-align:center;background-color:#F5EFE6;">
        <p style="margin:0;color:rgba(28,17,8,0.3);font-family:Georgia,serif;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;">&copy; 2026 Z FIT / SPA &mdash; Abidjan, Côte d'Ivoire</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function sendGiftCardEmail(data: GiftCardData) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: false },
  });

  const noteMessage = `Bénéficiaire: ${data.beneficiairePrenom} ${data.beneficiaireNom}${data.message ? ` | Message: ${data.message}` : ""}`;
  await supabaseServer.from("reservations").insert({
    prenom: data.offrantPrenom,
    nom: data.offrantNom,
    telephone: data.offrantPhone,
    type: "carte_cadeaux",
    soin: data.soin,
    message: noteMessage,
    status: "pending",
    created_at: new Date().toISOString(),
  });

  const logoAttachment = [getSpaLogoAttachment()];

  try {
    await transporter.sendMail({
      from: `"Le Spa by Z FIT" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `Nouvelle carte cadeaux — Z FIT / SPA | ${data.offrantPrenom} ${data.offrantNom} pour ${data.beneficiairePrenom} ${data.beneficiaireNom}`,
      html: buildGiftCardNotificationHtml(data),
      attachments: logoAttachment,
    });
    if (data.offrantEmail) {
      await transporter.sendMail({
        from: `"Le Spa by Z FIT" <${process.env.EMAIL_USER}>`,
        to: data.offrantEmail,
        subject: `Votre carte cadeaux — Z FIT / SPA`,
        html: buildGiftCardConfirmationHtml(data),
        attachments: logoAttachment,
      });
    }
    await transporter.sendMail({
      from: `"Le Spa by Z FIT" <${process.env.EMAIL_USER}>`,
      to: data.beneficiaireEmail,
      subject: `${data.offrantPrenom} ${data.offrantNom} vous offre une carte cadeaux — Z FIT / SPA`,
      html: buildGiftCardBeneficiaireHtml(data),
      attachments: logoAttachment,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Impossible d'envoyer l'email" };
  }
}

/* ─────────────────────────────────────────────
   ADMIN — MANUAL RESERVATION CREATION
───────────────────────────────────────────── */
export async function createAdminReservation(payload: {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  type: string;
  soin: string;
  date_reservation: string;
  heure: string;
  message: string;
  status: 'pending' | 'approved';
}) {
  let rowId: string;
  try {
    const { data: inserted, error } = await supabaseServer
      .from('reservations')
      .insert({
        nom:              payload.nom,
        prenom:           payload.prenom,
        email:            payload.email || null,
        telephone:        payload.telephone,
        type:             payload.type,
        soin:             payload.soin || null,
        date_reservation: payload.date_reservation || null,
        heure:            payload.heure || null,
        message:          payload.message || null,
        status:           payload.status,
        created_at:       new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error) throw error;
    rowId = inserted.id;
  } catch (e: any) {
    return { success: false, error: e.message };
  }

  const row = { id: rowId, ...payload };

  // Send approval email to client if status=approved and email provided
  if (payload.status === 'approved' && payload.email) {
    const emailRes = await sendApprovalEmail({
      nom:    payload.nom,
      prenom: payload.prenom,
      email:  payload.email,
      soin:   payload.soin || null,
      type:   payload.type,
      date:   payload.date_reservation || null,
      heure:  payload.heure || null,
    });
    return {
      success: true,
      reservation: row,
      emailSent: emailRes.success,
      emailError: emailRes.success ? null : (emailRes as any).error,
    };
  }

  return { success: true, reservation: row, emailSent: false, emailError: null };
}
