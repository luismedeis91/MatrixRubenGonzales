function placaValidaSudeste(placaInput){
    const placa = placaInput.toUpperCase().replace(/-/g, "")

    const regexMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/

    if(regexMercosul.test(placa)){
        const primeirasletras = placa.substring(0,3)
        
         const prefixosMercosulSudesteExemplos = [
            // São Paulo 
            "BRA", "BRB", "BRC", "BRD", 
            "BFA", "BFB", "BFC", "BFD", "BFE", "BFF", "BFG", "BFH", "BFI", "BFJ", "BFK", "BFL", "BFM",
            "QSA", "QSB", "QSC", "QSD", "QSE", "QSF", "QSG", "QSH", "QSI", "QSJ", "QSK", "QSL", "QSM",
            "RIA", "RIB", "RIC", "RID", "RIE", "RIF", "RIG", "RIH", "RII", "RIJ", "RIK", "RIL", "RIM",
            // Rio de Janeiro 
            "RIO", "RIW", "RJX", "RKA", "RKB", "RKC", "LVA", "LVB", "LVC", "LVD", "LVE",
            // Minas Gerais
            "QPA", "QPB", "QPC", "QPD", "QPE", "QPF", "QPG", "QPH", "QPI", "QPJ", "QPK", "QPL", "QPM",
            "RUA", "RUB", "RUC", "RUD", "RUE", "RUF", "RUG", "RUH", "RUI", "RUJ", "RUK", "RUL", "RUM",
            // Espírito Santo 
            "QVA", "QVB", "QVC", "QVD", "QVE", "QVF", "QVG", "QVH", "QVI", "QVJ", "QVK", "QVL", "QVM",
            "RCA", "RCB", "RCC"
           
        ];


        const primeiraLetraMercosul = primeirasletras[0]
        const iniciaisComunsMercosul = ['B', 'L', 'O', 'P', 'Q', 'R'];

        if(prefixosMercosulSudesteExemplos.includes(primeirasletras)){
            iniciaisComunsMercosul.includes(primeiraLetraMercosul)
            return true
        }


        return false

    }

    return false
    
}