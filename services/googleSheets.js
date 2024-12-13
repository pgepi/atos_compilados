'use server'

import { google } from 'googleapis';

async function getSheetsInstance() {

  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials/credentials.json', 
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function fetchSheetData(sheetId, range) {
  try {
    const sheets = await getSheetsInstance();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao acessar a API do Google Sheets:', error);
    throw new Error('Erro ao acessar a API do Google Sheets');
  }
}
