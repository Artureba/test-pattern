import { CarrinhoBuilder } from "./builders/CarrinhoBuilder.js";
import { UserMother } from "./builders/UserMother.js";
import { CheckoutService } from "../src/services/CheckoutService.js";

describe("CheckoutService", () => {
  describe("quando o pagamento falha", () => {
    test("deve retornar null", async () => {
      // Arrange
      const carrinho = new CarrinhoBuilder().build();

      const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: false }) };
      const pedidoRepoDummy = { salvar: jest.fn() };
      const emailDummy = { enviarEmail: jest.fn() };

      const checkoutService = new CheckoutService(gatewayStub, pedidoRepoDummy, emailDummy);

      // Act
      const pedido = await checkoutService.processarPedido(carrinho);

      // Assert
      expect(pedido).toBeNull();
      expect(gatewayStub.cobrar).toHaveBeenCalledTimes(1);
      expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
    });
  });

  describe("quando um cliente Premium finaliza a compra", () => {
    test("deve aplicar desconto e enviar e-mail de confirmação", async () => {
      // Arrange
      const usuarioPremium = UserMother.umUsuarioPremium();
      const carrinho = new CarrinhoBuilder()
        .comUsuario(usuarioPremium)
        .comItens([{ nome: "Produto Especial", preco: 200 }])
        .build();

      const gatewayStub = {
        cobrar: jest.fn().mockResolvedValue({ success: true }),
      };

      const pedidoRepoStub = {
        salvar: jest.fn().mockResolvedValue({ id: 1, total: 180 }),
      };

      const emailMock = {
        enviarEmail: jest.fn(),
      };

      const checkoutService = new CheckoutService(
        gatewayStub,
        pedidoRepoStub,
        emailMock
      );

      // Act
      const pedido = await checkoutService.processarPedido(carrinho);

      // Assert
      expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, expect.anything());
      expect(pedidoRepoStub.salvar).toHaveBeenCalled();
      expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
      expect(emailMock.enviarEmail).toHaveBeenCalledWith(
        "premium@email.com",
        "Seu Pedido foi Aprovado!",
        expect.anything()
      );

      expect(pedido).not.toBeNull();
      expect(pedido.total).toBe(180);
    });
  });
});
