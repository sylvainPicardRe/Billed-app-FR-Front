/**
 * @jest-environment jsdom
 */

import {fireEvent, getAllByTestId, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

// Regroupe les tests liés à la connexion en tant qu'employé.
describe("Given I am connected as an employee", () => {
  // Sous-groupe de tests pour la page des factures.
  describe("When I am on Bills Page", () => {
     // Teste si l'icône des factures est mise en surbrillance.
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Simule le stockage local avec un utilisateur de type 'Employee'.
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Crée un élément racine pour l'application.
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

       // Initialise le routeur et navigue vers la page des factures.
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      // Attend que l'icône de la fenêtre soit présente dans le DOM.
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      // Vérifie que l'icône a la classe 'active-icon', indiquant qu'elle est surlignée.
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()


    })

    // Teste si les factures sont triées de la plus ancienne à la plus récente.
    test("Then bills should be ordered from most recent to oldest", () => {
      // Génère le HTML des factures en utilisant les données fictives.
      document.body.innerHTML = BillsUI({ data: bills })

      // Récupère tous les éléments de date au format AAAA-MM-JJ.
      const dateElements = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      
      // Convertit les chaînes de caractères en objets Date.
      const dates = dateElements.map((element) => new Date(element.innerHTML))

       // Trie les dates par ordre croissant.
      const datesSorted = [...dates].sort((a, b) => b - a)

      // Vérifie que les dates originales sont égales aux dates triées.
      expect(dates).toEqual(datesSorted)
    })
  })
})

// describe('Given I am connected as Employee and I am on Bills page and I clicked on a bill', () => {
//   describe('When I click on the icon eye', () => {
//     test('A modal should open', () => {
//       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//       window.localStorage.setItem('user', JSON.stringify({
//         type: 'Employee'
//       }))
//       document.body.innerHTML = BillsUI({data: [bills[0]]})
//       const onNavigate = (pathname) => {
//         document.body.innerHTML = ROUTES({ pathname })
//       }
//       const store = null
//       const bill = new Bills({
//         document, onNavigate, store, bills, localStorage: window.localStorage
//       })

//       const handleClickIconEye = jest.fn(bill.handleClickIconEye)
//       const eye = screen.getByTestId('icon-eye')
      
//       eye.addEventListener('click', handleClickIconEye)
//       userEvent.click(eye)
//       expect(handleClickIconEye).toHaveBeenCalled()

//       const modale = screen.getByTestId('modal') 
//       expect(modale).toBeTruthy()
//     })
//   })
// })

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const type  = await screen.getByText("Type")
      expect(type).toBeTruthy()
      // const contentRefused  = await screen.getByText("Refusé (2)")
      // expect(contentRefused).toBeTruthy()
      // expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})

