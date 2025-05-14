/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { fireEvent, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

// import { getAllByRole } from '@testing-library/dom'

import NewBill from '../containers/NewBill.js'
import NewBillUI from "../views/NewBillUI.js"

import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"

import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

beforeEach(() => {
  const html = NewBillUI()
  document.body.innerHTML = html
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('When I am on the NewBill page', () => {
  test('Then, right form should be filled', () => {
    const formNewBill = screen.getByTestId('form-new-bill')
    const handleSubmit = jest.fn()
    formNewBill.addEventListener('submit', handleSubmit)

    fireEvent.submit(formNewBill) 

    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  test('Then...', async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({pathname}) 
    }
  
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employees'
    }))
  
    const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})
    
    const inputFile = screen.getByTestId('file')
    const file = new File(['(image simulée)'], 'image.png', { type: 'image/png' });

    await userEvent.upload(inputFile, file);

    expect(inputFile.files[0]).toBe(file);

    const handleChangeFile = jest.fn((file) => newBill.handleChangeFile(file))
    
    const btn = screen.getByRole("button") 
    btn.addEventListener("click", handleChangeFile)
    fireEvent.click(btn)

    expect(handleChangeFile).toHaveBeenCalledTimes(1)
  })

  test('Then', () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({pathname}) 
    }
  
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employees'
    }))
  
    const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})

    const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))

    const formNewBill = screen.getByTestId('form-new-bill')

    formNewBill.addEventListener('click', handleSubmit)
    fireEvent.click(formNewBill)

    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})

describe("Given I am connected as an employee", () => {
  describe("When I submit a new bill", () => {
    test("Then it should send a POST request and redirect to the Bills page", async () => {
      document.body.innerHTML = `<div id="root"></div>`;
      router();

      window.onNavigate(ROUTES.NewBill); // Simuler la navigation

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore, // Simuler l'API
        localStorage: window.localStorage,
      });

      // Simuler le remplissage du formulaire
      const inputExpenseType = screen.getByTestId("expense-type");
      fireEvent.change(inputExpenseType, { target: { value: "Transport" } });

      const inputDate = screen.getByTestId("datepicker");
      fireEvent.change(inputDate, { target: { value: "2023-12-01" } });

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, { target: { value: "100" } });

      const inputVAT = screen.getByTestId("vat");
      fireEvent.change(inputVAT, { target: { value: "20" } });

      const inputPct = screen.getByTestId("pct");
      fireEvent.change(inputPct, { target: { value: "10" } });

      const inputFile = screen.getByTestId("file");
      const fakeFile = new File(["image"], "test.png", { type: "image/png" });
      userEvent.upload(inputFile, fakeFile);

      // Simuler l'envoi du formulaire
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Vérifier que handleSubmit a bien été appelé
      expect(handleSubmit).toHaveBeenCalled();

      // Vérifier que la requête POST a bien été effectuée
      await new Promise(process.nextTick);
      expect(mockStore.bills().create).toHaveBeenCalled();

      // Vérifier que la navigation se fait bien vers la page des notes de frais
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });
});