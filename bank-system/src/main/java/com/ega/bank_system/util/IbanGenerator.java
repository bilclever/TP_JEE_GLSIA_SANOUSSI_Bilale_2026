package com.ega.bank_system.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Component
public class IbanGenerator {

    @Value("${app.bank.country-code:TN}")
    private String countryCode;

    @Value("${app.bank.bank-code:EGA}")
    private String bankCode;

    private static final Map<String, Integer> IBAN_LENGTHS = new HashMap<>();
    private static final Random random = new Random();

    static {
        // IBAN lengths par pays (code pays -> longueur totale)
        IBAN_LENGTHS.put("TN", 24); // Tunisie
        IBAN_LENGTHS.put("FR", 27);
        IBAN_LENGTHS.put("DE", 22);
        IBAN_LENGTHS.put("ES", 24);
        IBAN_LENGTHS.put("IT", 27);
        IBAN_LENGTHS.put("GB", 22);
        IBAN_LENGTHS.put("BE", 16);
        IBAN_LENGTHS.put("NL", 18);
    }

    public String generateIban() {
        String code = countryCode.toUpperCase();
        int length = IBAN_LENGTHS.getOrDefault(code, 24);

        // Générer les chiffres de vérification (IBANChecksum)
        String checkDigits = generateCheckDigits(code, bankCode);

        // Générer le numéro de compte aléatoire
        int accountLength = length - code.length() - 2 - bankCode.length();
        String accountNumber = generateRandomNumbers(accountLength);

        // Construire l'IBAN
        return code + checkDigits + bankCode + accountNumber;
    }

    public boolean validateIban(String iban) {
        if (iban == null || iban.length() < 15 || iban.length() > 34) {
            return false;
        }

        // Vérifier que les 2 premiers caractères sont des lettres et les 2 suivants sont des chiffres
        if (!iban.substring(0, 2).matches("[A-Z]{2}")) {
            return false;
        }
        if (!iban.substring(2, 4).matches("[0-9]{2}")) {
            return false;
        }

        // Vérifier les chiffres de contrôle
        return validateChecksum(iban);
    }

    private String generateCheckDigits(String countryCode, String bankCode) {
        // Générer les chiffres de vérification IBAN (mod-97)
        String checkString = "00";
        int check = calculateIbanChecksum(countryCode + checkString + bankCode + "0000000000000000");
        int checkDigits = (98 - check) % 97;
        return String.format("%02d", checkDigits);
    }

    private int calculateIbanChecksum(String ibanPartial) {
        // Convertir l'IBAN en nombres (A=10, B=11, ..., Z=35)
        StringBuilder numeric = new StringBuilder();
        for (char c : ibanPartial.toCharArray()) {
            if (c >= '0' && c <= '9') {
                numeric.append(c);
            } else if (c >= 'A' && c <= 'Z') {
                numeric.append(c - 'A' + 10);
            }
        }

        // Calculer le mod 97
        return mod97(numeric.toString());
    }

    private int mod97(String numeric) {
        int remainder = 0;
        for (char digit : numeric.toCharArray()) {
            remainder = (remainder * 10 + Character.getNumericValue(digit)) % 97;
        }
        return remainder;
    }

    private boolean validateChecksum(String iban) {
        // Déplacer les 4 premiers caractères à la fin et convertir en nombres
        String rearranged = iban.substring(4) + iban.substring(0, 4);
        return calculateIbanChecksum(rearranged) == 1;
    }

    private String generateRandomNumbers(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}

