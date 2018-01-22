import {Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn, EntityRepository, Repository} from 'typeorm'
import {MediaModel} from './media-model'
import {LibraryModel} from './library-model'

@Entity({name: 'map'})
export class MapModel
{
    @PrimaryGeneratedColumn()
    public id: number

    @Column({name: 'library_id'})
    public libraryId: number;

    @ManyToOne(t => LibraryModel)
    @JoinColumn({name: 'library_id'})
    public library: LibraryModel;

    @Column()
    public title: string

    @Column({name: 'media_id'})
    public mediaId: number;

    @ManyToOne(t => MediaModel)
    @JoinColumn({name: 'media_id'})
    public media?: MediaModel
}

@EntityRepository(MapModel)
export class MapRepository extends Repository<MapModel>
{
    public async findAllByLibrary({libraryID}: {libraryID: number})
    {
        return this.find({
            select: [
                'id',
                'title',
                'media'
            ],
            where: {
                libraryId: libraryID
            }
        })
    }
}