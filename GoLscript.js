// Tabelle dynamisch generieren
// Suche nach "Traversing an HTML table with JavaScript
const NbRows = 50;
const NbCols = 50;
const ColorActive = "blue";
const ColorInactive = "yellow";

var GoL = []; // Matrix der Felder
var ListProc = []; // Liste der aktuell aktiven Felder
var ListProcNew = []; // Liste der neuen aktiven Felder
var CountSteps = 0; // Anzahl der durchgeführten Schritte
var CountActive = 0; // Anzahl aktive Felder

function generate_table() {
	// get the reference for the table place
	var divtbl = document.getElementById("goltable");

	// creates a <table> element and a <tbody> element
	// if (document.getElementById("GoLTable") != undefined) {
	// document.getElementById("GoLTable").remove();
	// }
	var tbl = document.createElement("table");
	tbl.setAttribute("id", "GoLTable");
	var tblBody = document.createElement("tbody");

	// Initialisieren globale Tabellen
	ListProc = [];
	ListProcNew = [];
	CountSteps = 0;
	// creating all cells
	for (var i = 0; i < NbRows; i++) {
		// creates a table row
		var row = document.createElement("tr");

		for (var j = 0; j < NbCols; j++) {
			// Create a <td> element and a text node, make the text
			// node the contents of the <td>, and put the <td> at
			// the end of the table row
			var cell = document.createElement("td");
			// var cellText = document.createTextNode("cell in row "+i+", column
			// "+j);
			var cellText = document.createTextNode("X");
			cell.appendChild(cellText);
			// cell.setAttribute("onclick", "javascript:tableText(this,i,j);");
			cell.onclick = function() {
				clickField(this);
			};
			cell.setAttribute("bgcolor", ColorInactive);
			row.appendChild(cell);
		}

		// add the row to the end of the table body
		tblBody.appendChild(row);
	}

	// put the <tbody> in the <table>
	tbl.appendChild(tblBody);
	// falls Tabelle schon existiert durch neue ersetzen
	if (divtbl.childNodes.length == 0) {
		divtbl.appendChild(tbl);
	} else {
		divtbl.replaceChild(tbl, divtbl.childNodes[0]);
	}
	// sets the border attribute of tbl to 2;
	tbl.setAttribute("border", "2");
	tbl.setAttribute("style", "cursor: cell");
	Init_GoL();
	CountActive = 0;
	CountSteps = 0;
	document.getElementById("nbactive").innerHTML = CountActive;
	document.getElementById("nbsteps").innerHTML = CountSteps;
}

// Attribut der Zelle setzen bei Click
function clickField(tableCell) {
	var CellColor = tableCell.getAttribute("bgcolor");
	var row_num = tableCell.parentNode.rowIndex;
	var col_num = tableCell.cellIndex;
	if (CellColor == ColorActive) {
		// Farbe auf inaktiv
		tableCell.setAttribute("bgcolor", ColorInactive);
		// Feld auf inactive setzen
		GoL[row_num][col_num].Status = false;
		// Löschen aus ListProc
		DeleteListProc(row_num, col_num);
		CountActive--;
	} else {
		// Farbe auf aktiv setzen
		tableCell.setAttribute("bgcolor", ColorActive);
		// Feld auf active setzen
		GoL[row_num][col_num].Status = true;
		// Neuer Eintrag ListProc
		ListProc.push({
			Row : row_num,
			Col : col_num
		});
		CountActive++;
	}
	document.getElementById("nbactive").innerHTML = CountActive;
}
// Eintrag aus ListProc löschen
function DeleteListProc(row, col) {
	for (var i = 0; i < ListProc.length; i++) {
		if ((ListProc[i].Row == row) && (ListProc[i].Col == col)) {
			ListProc.splice(i, 1);
			return;
		}
	}
}
// Aktion bei Button "Einzelschritt"
function procStep() {

	var neighbours = [];
	var Neighb = []; // actual neighbour
	var actNeighb = 0;
	var action = false;  // zeigt an, ob noch was passiert
	
	if (ListProc.length == 0) {
		alert("Keine aktiven Felder !");
		return false;
	}
	// Liste der aktiven Felder abarbeiten
	for (var i = 0; i < ListProc.length; i++) {
		// alle Nachbarn ermitteln
		neighbours = GetNeighbours(ListProc[i].Row, ListProc[i].Col);
		actNeighb = 0;
		// alle Nachbarn verarbeiten
		for (var j = 0; j < neighbours.length; j++) {
			// aktuellen Nachbarn aus Matrix merken
			Neighb = GoL[neighbours[j].Row][neighbours[j].Col];
			// Aktive Nachbarn um 1 erhöhen
			Neighb.NbActive++;
			// Setzen neuer Status (hängt ab von Anzahl Nachbarn und aktueller
			// Status)
			SetNewStatus(Neighb);
			// Wenn Nachbar aktiv wird in neue Liste aufnehmen
			if ((Neighb.Status == false) && (Neighb.NewStatus == true)) {
				ListProcNew.push({
					Row : neighbours[j].Row,
					Col : neighbours[j].Col
				});
			} // ENDIF
		} // ENDFOR
	} // ENDFOR

	// Liste der aktiven Felder abarbeiten, Farbe setzen und löschen
	var ListProc2 = [];
	for (var i = 0; i < ListProc.length; i++) {
		if (GoL[ListProc[i].Row][ListProc[i].Col].NewStatus == false) {
			// Farbe auf inaktiv setzen
			SetColor(ListProc[i].Row, ListProc[i].Col, ColorInactive);
			CountActive--;
			action = true;
		} else {
			// die aktiven Felder merken
			ListProc2.push(ListProc[i]);
		}
	}
	// die aktiven zurückkopieren
	ListProc = ListProc2;

	// Liste der neuen Felder abarbeiten, Farbe setzen und an ListProc anhängen
	for (var i = 0; i < ListProcNew.length; i++) {
		if (GoL[ListProcNew[i].Row][ListProcNew[i].Col].NewStatus == true) {
			// Farbe auf aktiv setzen
			SetColor(ListProcNew[i].Row, ListProcNew[i].Col, ColorActive);
			CountActive++;
			action = true;
			// Eintrag in Liste der aktiven Felder
			ListProc.push({
				Row : ListProcNew[i].Row,
				Col : ListProcNew[i].Col
			});
		}
	}
	// Liste der neuen Felder löschen
	ListProcNew = [];
	// Matrix zurücksetzen
	for (var i = 0; i < NbRows; i++) {
		for (var j = 0; j < NbCols; j++) {
			GoL[i][j].Status = GoL[i][j].NewStatus;
			GoL[i][j].NewStatus = false;
			GoL[i][j].NbActive = 0;
		}
	}
	// Anzahl Schritte erhöhen
	CountSteps++;
	document.getElementById("nbsteps").innerHTML = CountSteps;
	document.getElementById("nbactive").innerHTML = CountActive;
	// Prüfen, ob noch was passiert ist
	if (action == false) {
		alert ("Keine Veränderung !");
	}
	return action;

} // function procStep() {
function btnStep() {
	procStep();
}
function btnStep100() {
	var add = 0;
	var id = setInterval(function() {
		if (add >= 100) {
			clearInterval(id);
		} else {
			if (procStep() == false) {
				clearInterval(id);
			} else {
				add++;
			}
		}
	}, 200);
}
function GetNeighbours(Row, Col) {
	var neighbours = [];

	// Alle Nachbarn prüfen beginnend bei 12 Uhr
	if (IsNeighbour(Row - 1, Col) == true) {
		neighbours.push({
			Row : Row - 1,
			Col : Col
		});
	}
	// 1 Uhr
	if (IsNeighbour(Row - 1, Col + 1) == true) {
		neighbours.push({
			Row : Row - 1,
			Col : Col + 1
		});
	}
	// 3 Uhr
	if (IsNeighbour(Row, Col + 1) == true) {
		neighbours.push({
			Row : Row,
			Col : Col + 1
		});
	}
	// 4 Uhr
	if (IsNeighbour(Row + 1, Col + 1) == true) {
		neighbours.push({
			Row : Row + 1,
			Col : Col + 1
		});
	}
	// 6 Uhr
	if (IsNeighbour(Row + 1, Col) == true) {
		neighbours.push({
			Row : Row + 1,
			Col : Col
		});
	}
	// 7 Uhr
	if (IsNeighbour(Row + 1, Col - 1) == true) {
		neighbours.push({
			Row : Row + 1,
			Col : Col - 1
		});
	}
	// 9 Uhr
	if (IsNeighbour(Row, Col - 1) == true) {
		neighbours.push({
			Row : Row,
			Col : Col - 1
		});
	}
	// 10 Uhr
	if (IsNeighbour(Row - 1, Col - 1) == true) {
		neighbours.push({
			Row : Row - 1,
			Col : Col - 1
		});
	}
	return neighbours;
}

function IsNeighbour(Row, Col) {
	if ((Row >= 0) && (Col >= 0) && (Row < NbRows) && (Col < NbCols)) {
		return true;
	} else {
		return false;
	}
}
// Status berechnen aus aktuellem Status und Anzahl Nachbarn
function SetNewStatus(Element) {
	if (Element.Status == true) {
		if ((Element.NbActive == 2) || (Element.NbActive == 3)) {
			Element.NewStatus = true;
		} else {
			Element.NewStatus = false;
		}
	} else { // Status ist inactive
		if (Element.NbActive == 3) {
			Element.NewStatus = true;
		} else {
			Element.NewStatus = false;
		}
	}
}
// Feld in Ausgabetabelle auf neue Farbe setzen
function SetColor(row, col, color) {
	var Cell = document.getElementById('GoLTable').rows[row].cells[col];

	Cell.setAttribute("bgcolor", color);
}
// Initialisieren GoL Tabelle
function Init_GoL() {

	for (var i = 0; i < NbRows; i++) {
		var data = [];
		for (var j = 0; j < NbCols; j++) {
			data.push({
				Status : false,
				NbActive : 0,
				NewStatus : false
			});
		}
		GoL.push(data);
	}
}
