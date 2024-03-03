using Microsoft.AspNetCore.SignalR;

namespace MessengerApp
{
	public class Program
	{
		public static void Main(string[] args)
		{
			var builder = WebApplication.CreateBuilder(args);

			builder.Services.AddSignalR(o=>o.MaximumReceiveMessageSize= 2 * 1024 * 1024);
			builder.Services.AddCors();

			var app = builder.Build();

			app.UseCors(o=>o
			//.WithOrigins("http://localhost:4200")
			.AllowAnyHeader()
			.AllowAnyMethod()
			.SetIsOriginAllowed((host)=>true)
			.AllowCredentials()
			);

			app.MapHub<MyHub>("/chat");

			app.Run();
		}

		public class MyHub : Hub
		{
			public void ShareText(string username, string message)
			{
				this.Clients.All.SendAsync("ReceiveText", username, message);
			}
			public void ShareImg(string username, string img)
			{
				this.Clients.All.SendAsync("ReceiveImg", username, img);
			}

		}
	}
}
