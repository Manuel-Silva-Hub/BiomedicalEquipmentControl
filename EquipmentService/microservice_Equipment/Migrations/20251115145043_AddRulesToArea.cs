using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace microservice_Equipment.Migrations
{
    /// <inheritdoc />
    public partial class AddRulesToArea : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AreaEquipmentRules_AreaId",
                table: "AreaEquipmentRules",
                column: "AreaId");

            migrationBuilder.AddForeignKey(
                name: "FK_AreaEquipmentRules_Areas_AreaId",
                table: "AreaEquipmentRules",
                column: "AreaId",
                principalTable: "Areas",
                principalColumn: "AreaId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AreaEquipmentRules_Areas_AreaId",
                table: "AreaEquipmentRules");

            migrationBuilder.DropIndex(
                name: "IX_AreaEquipmentRules_AreaId",
                table: "AreaEquipmentRules");
        }
    }
}
