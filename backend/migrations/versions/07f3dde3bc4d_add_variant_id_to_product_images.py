"""add_variant_id_to_product_images

Revision ID: 07f3dde3bc4d
Revises: 9d8dcc8f131d
Create Date: 2026-09-24 23:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '07f3dde3bc4d'
down_revision: Union[str, Sequence[str], None] = '9d8dcc8f131d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add variant_id column to product_images
    op.add_column(
        'product_images',
        sa.Column('variant_id', postgresql.UUID(as_uuid=True), nullable=True)
    )
    op.create_foreign_key(
        'fk_product_images_variant_id',
        'product_images',
        'product_variants',
        ['variant_id'],
        ['id'],
        ondelete='CASCADE'
    )
    op.create_index(
        'ix_product_images_variant_id',
        'product_images',
        ['variant_id']
    )

    # 2. Backfill existing images to their corresponding variant by matching product_id and color
    op.execute("""
        UPDATE product_images pi
        SET variant_id = pv.id
        FROM product_variants pv
        WHERE pi.product_id = pv.product_id 
          AND LOWER(TRIM(pi.color)) = LOWER(TRIM(pv.color))
          AND pi.variant_id IS NULL;
    """)


def downgrade() -> None:
    op.drop_index('ix_product_images_variant_id', table_name='product_images')
    op.drop_constraint('fk_product_images_variant_id', 'product_images', type_='foreignkey')
    op.drop_column('product_images', 'variant_id')
